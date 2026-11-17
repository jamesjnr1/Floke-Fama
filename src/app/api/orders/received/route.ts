import { NextResponse, type NextRequest } from 'next/server';
import type { Models } from 'node-appwrite';
import { catalogue } from '@/data/catalogue';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { getClientSession } from '@/lib/auth/server';
import { CONSUMABLES } from '@/lib/categories';
import { needsInstallation, tidyName } from '@/lib/installation';
import type { SavedOrder } from '@/lib/orders';
import { registerPurchase } from '@/lib/service/server';

/**
 * A hospital tells us it has received the equipment from one of its quote requests (its portal, Quotes → "We've
 * received it"): the equipment goes on its list, with installation booked where the machine needs it, the same as a
 * purchase. Consumables are skipped. Once per request, and only the hospital's own request.
 */
export const dynamic = 'force-dynamic';
type OrderRow = Models.Row & { data: string };

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  if (!appwrite) return NextResponse.json({ error: 'Not set up.' }, { status: 503 });
  const s = await getClientSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { reference } = ((await req.json().catch(() => ({}))) ?? {}) as { reference?: unknown };
  if (typeof reference !== 'string' || !/^FF-[A-Z0-9]{4,12}$/.test(reference)) return NextResponse.json({ error: 'Unknown request.' }, { status: 400 });

  const args = { databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference };
  let row: OrderRow;
  try {
    row = (await appwrite.tables.getRow(args)) as OrderRow;
  } catch (e) {
    if (isNotFound(e)) return NextResponse.json({ error: 'Unknown request.' }, { status: 404 });
    throw e;
  }
  const o = JSON.parse(String(row.data)) as SavedOrder;
  if (o.account !== s.email.toLowerCase()) return NextResponse.json({ error: 'Unknown request.' }, { status: 404 });
  if (o.equipmentAdded) return NextResponse.json({ ok: true, already: true });

  // Marked first, so a second tap (or a second tab) never adds the equipment twice
  const marked: SavedOrder = { ...o, equipmentAdded: true, status: 'delivered', log: [...(o.log ?? []), { at: new Date().toISOString(), by: s.name, text: 'Received by the hospital: equipment added to its list' }].slice(-100) };
  if ((await appwrite.tables.getRow(args) as OrderRow).$updatedAt !== row.$updatedAt) return NextResponse.json({ ok: true, already: true });
  await appwrite.tables.updateRow({ ...args, data: { data: JSON.stringify(marked) } });

  const equipment = o.items.flatMap((x) => {
    const p = catalogue.find((c) => c.slug === x.slug);
    return p && p.category !== CONSUMABLES ? [{ slug: p.slug, name: tidyName(p.name), brand: p.brand, image: p.image, qty: x.qty, install: needsInstallation(p) }] : [];
  });
  try {
    await registerPurchase(s, o.reference, equipment);
  } catch (e) {
    // Not added after all: let them try again
    console.error('[orders] received: equipment not added', reference, e);
    await appwrite.tables.updateRow({ ...args, data: { data: JSON.stringify({ ...o }) } }).catch(() => {});
    return NextResponse.json({ error: 'The equipment could not be added just now. Please try again.' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, added: equipment.reduce((n, i) => n + i.qty, 0), installs: equipment.filter((i) => i.install).length });
}
