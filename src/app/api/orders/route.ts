import { NextResponse, type NextRequest } from 'next/server';
import { Query, type Models } from 'node-appwrite';
import { catalogue } from '@/data/catalogue';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { getSession } from '@/lib/auth/server';
import { needsInstallation } from '@/lib/installation';
import type { SavedOrder } from '@/lib/orders';
import { registerPurchase } from '@/lib/service/server';

/**
 * A hospital's orders (Appwrite table `orders`, one row per order, keyed by its reference). GET lists the
 * signed-in hospital's orders; POST records one placed at checkout and turns it into the hospital's equipment
 * (installation jobs for systems an engineer must commission), once. Without Appwrite: `{ enabled: false }`,
 * and orders stay in the browser.
 */
export const dynamic = 'force-dynamic';

type OrderRow = Models.Row & { account: string; data: string };
const noStore = { 'Cache-Control': 'private, no-store' };
const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
};
/** "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case). */
const tidyName = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { rows } = await appwrite.tables.listRows<OrderRow>({
    databaseId: DATABASE_ID,
    tableId: TABLES.orders,
    queries: [Query.equal('account', s.email.toLowerCase()), Query.orderDesc('$createdAt'), Query.limit(100)],
  });
  const orders = rows.flatMap((r) => { try { return [JSON.parse(r.data) as SavedOrder]; } catch { return []; } });
  return NextResponse.json({ enabled: true, orders }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'Orders are not set up.' }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  const raw = await req.text();
  if (raw.length > 32 * 1024) return NextResponse.json({ error: 'That order is too large.' }, { status: 413 });
  let o: SavedOrder;
  try {
    o = JSON.parse(raw) as SavedOrder;
  } catch {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }
  if (!/^FF-[A-Z0-9]{4,12}$/.test(o?.reference ?? '') || !['momo', 'card', 'bank'].includes(o.method) || !Array.isArray(o.items) || o.items.length === 0 || o.items.length > 100)
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });

  // Only catalogue items count, with names and installation needs from the catalogue (not from the browser)
  const items = o.items.flatMap((x) => {
    const p = catalogue.find((c) => c.slug === x.slug);
    const qty = Math.min(50, Math.max(1, Math.floor(Number(x.qty) || 1)));
    return p ? [{ p, qty }] : [];
  });
  const order: SavedOrder = {
    reference: o.reference,
    placedAt: new Date().toISOString(),
    account: s.email.toLowerCase(),
    items: items.map(({ p, qty }) => ({ slug: p.slug, name: p.name, qty })),
    method: o.method,
    region: String(o.region ?? '').slice(0, 80),
    address: String(o.address ?? '').slice(0, 300),
    status: 'awaiting-payment',
  };

  try {
    await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: order.reference });
    return NextResponse.json({ order }, { headers: noStore }); // already recorded
  } catch (e) {
    if (!isNotFound(e)) throw e;
  }
  await appwrite.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: order.reference, data: { account: order.account, data: JSON.stringify(order) } });

  // A hospital's purchase becomes its equipment; consumables are skipped
  if (s.role === 'client') {
    const equipment = items
      .filter(({ p }) => p.category !== 'consumables')
      .map(({ p, qty }) => ({ slug: p.slug, name: tidyName(p.name), brand: p.brand, image: p.image, qty, install: needsInstallation(p) }));
    await registerPurchase(s, order.reference, equipment);
  }
  return NextResponse.json({ order }, { headers: noStore });
}
