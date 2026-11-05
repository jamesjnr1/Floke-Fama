import { NextResponse, type NextRequest } from 'next/server';
import { Query, type Models } from 'node-appwrite';
import { catalogue } from '@/data/catalogue';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { getClientSession } from '@/lib/auth/server';
import { emailSales } from '@/lib/support-email';
import { siteUrl } from '@/lib/utils';
import { departmentLabel, timelineLabel, timelines } from '@/lib/order-needs';
import { needsInstallation, tidyName } from '@/lib/installation';
import type { SavedOrder } from '@/lib/orders';
import { registerPurchase } from '@/lib/service/server';
import { CONSUMABLES } from '@/lib/categories';

/**
 * A hospital's orders (Appwrite table `orders`, one row per order, keyed by its reference). GET lists the
 * signed-in hospital's orders; POST records one placed at checkout and turns it into the hospital's equipment
 * (installation jobs for systems an engineer must commission), once. It lands on the admin console's sales board and
 * sales gets an email. Without Appwrite: `{ enabled: false }`, and orders stay in the browser.
 */
export const dynamic = 'force-dynamic';

type OrderRow = Models.Row & { account: string; data: string };
const noStore = { 'Cache-Control': 'private, no-store' };
const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
};

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  const s = await getClientSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { rows } = await appwrite.tables.listRows<OrderRow>({
    databaseId: DATABASE_ID,
    tableId: TABLES.orders,
    queries: [Query.equal('account', s.email.toLowerCase()), Query.orderDesc('$createdAt'), Query.limit(100)],
  });
  // The hospital sees its order, never the sales team's notes and history; the price once it has been sent to them
  const priced = new Set(['priced', 'paid', 'processing', 'delivered']);
  const orders = rows.flatMap((r) => {
    try {
      const { log: _log, ...order } = JSON.parse(r.data) as SavedOrder;
      void _log;
      return [{ ...order, amount: priced.has(order.status) ? order.amount : undefined }];
    } catch {
      return [];
    }
  });
  return NextResponse.json({ enabled: true, orders }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'Orders are not set up.' }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getClientSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  const raw = await req.text();
  if (raw.length > 32 * 1024) return NextResponse.json({ error: 'That order is too large.' }, { status: 413 });
  let o: SavedOrder;
  try {
    o = JSON.parse(raw) as SavedOrder;
  } catch {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }
  if (!/^FF-[A-Z0-9]{4,12}$/.test(o?.reference ?? '') || !['quote', 'momo', 'card', 'bank'].includes(o.method) || !Array.isArray(o.items) || o.items.length === 0 || o.items.length > 100)
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });

  // Only catalogue items count, with names and installation needs from the catalogue (not from the browser)
  const items = o.items.flatMap((x) => {
    const p = catalogue.find((c) => c.slug === x.slug);
    const qty = Math.min(50, Math.max(1, Math.floor(Number(x.qty) || 1)));
    return p ? [{ p, qty }] : [];
  });
  const c = (o as { customer?: Record<string, unknown> }).customer ?? {};
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const who = {
    name: text(c.name, 120) || s.name,
    email: s.email,
    phone: text(c.phone, 40) || s.phone || '',
    facility: text(c.organisation, 160) || s.facility || s.name,
  };
  const order: SavedOrder = {
    reference: o.reference,
    placedAt: new Date().toISOString(),
    account: s.email.toLowerCase(),
    items: items.map(({ p, qty }) => ({ slug: p.slug, name: p.name, qty })),
    method: o.method,
    region: String(o.region ?? '').slice(0, 80),
    address: String(o.address ?? '').slice(0, 300),
    status: 'awaiting-payment',
    needs: {
      department: departmentLabel(o.needs?.department) ? String(o.needs?.department) : '',
      timeline: timelines.some((t) => t.id === o.needs?.timeline) ? String(o.needs?.timeline) : 'quarter',
      notes: String(o.needs?.notes ?? '').trim().slice(0, 1000),
    },
    contact: { name: who.name, organisation: who.facility, phone: who.phone },
  };

  // Saved on the sales board. If the database can't be reached, the order still goes to sales by email (below); if
  // even that fails, the checkout asks the hospital to send it to sales itself, so an order is never lost
  let onBoard = true;
  try {
    await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: order.reference });
    return NextResponse.json({ order, sales: true }, { headers: noStore }); // already recorded
  } catch (e) {
    if (!isNotFound(e)) {
      console.error('[orders] database not reachable', e);
      onBoard = false;
    }
  }
  if (onBoard)
    await appwrite.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: order.reference, data: { account: order.account, data: JSON.stringify(order) } }).catch((e) => {
      console.error('[orders] not saved on the sales board', e);
      onBoard = false;
    });

  // A hospital's purchase becomes its equipment; consumables are skipped. A quote request is not a purchase yet: its
  // equipment is added when sales marks it as paid (lib/admin/actions.ts)
  if (onBoard && s.role === 'client' && order.method !== 'quote') {
    const equipment = items
      .filter(({ p }) => p.category !== CONSUMABLES)
      .map(({ p, qty }) => ({ slug: p.slug, name: tidyName(p.name), brand: p.brand, image: p.image, qty, install: needsInstallation(p) }));
    await registerPurchase(s, order.reference, equipment);
  }

  // It is on the admin console's sales board now; sales also gets an email (Brevo) so they know to look
  const momo = (o as { momo?: { network?: unknown } }).momo;
  const lines = order.items.map((i) => ({ name: tidyName(i.name), qty: i.qty }));
  const payment = (order.method === 'momo' && text(momo?.network, 30)) || { quote: 'Agreed with sales after the quote', momo: 'Mobile money', card: 'Card', bank: 'Bank transfer' }[order.method];
  const timeline = timelines.find((t) => t.id === order.needs?.timeline);
  const department = departmentLabel(order.needs?.department);
  const emailed = await emailSales(
    `${timeline?.id === 'urgent' ? 'URGENT quote request' : 'New quote request'} ${order.reference}: ${who.facility}`,
    {
      Reference: order.reference,
      Items: lines.map((i) => `• ${i.name} × ${i.qty}`).join('\n'),
      ...(department ? { Department: department } : {}),
      Needed: timelineLabel(order.needs?.timeline) ?? '',
      ...(order.needs?.notes ? { Notes: order.needs.notes } : {}),
      Payment: payment,
      'Deliver to': [order.address, order.region].filter(Boolean).join(', '),
      Name: who.name,
      'Hospital or lab': who.facility,
      Phone: who.phone,
      Email: who.email,
    },
    onBoard
      ? { phone: who.phone, replyTo: who.email, link: { href: `${siteUrl}/admin?tab=orders&order=${order.reference}`, label: 'Open it on the sales board' } }
      : { phone: who.phone, replyTo: who.email },
  ).then((sent) => Boolean(sent), (e) => (console.error('[orders] sales email not sent', e), false));
  // Sales has it when it's on the sales board, or at least in their inbox; otherwise the checkout asks the hospital to send it
  const sales = onBoard || Boolean(emailed);
  return NextResponse.json({ order, sales }, { headers: noStore });
}
