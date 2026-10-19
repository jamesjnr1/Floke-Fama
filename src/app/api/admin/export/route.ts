import { NextResponse, type NextRequest } from 'next/server';
import { loadAdminData } from '@/lib/admin/data';
import { getSession } from '@/lib/auth/server';

/** CSV downloads for the admin console (orders, accounts, service requests, equipment). Admins only. */
export const dynamic = 'force-dynamic';

// A leading = + - @ would run as a formula in Excel, so such cells get a ' in front
const cell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (head: string[], rows: unknown[][]) => [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (s?.role !== 'admin') return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const d = await loadAdminData();
  const table = req.nextUrl.searchParams.get('table');
  let body: string;
  if (table === 'orders') body = csv(['Reference', 'Placed', 'Account', 'Items', 'Units', 'Payment', 'Region', 'Address', 'Status'], d.orders.map((o) => [o.reference, o.placedAt, o.account, o.items.map((i) => `${i.qty} x ${i.name}`).join('; '), o.items.reduce((n, i) => n + i.qty, 0), o.method, o.region, o.address, o.status]));
  else if (table === 'accounts') body = csv(['Name', 'Organisation', 'Email', 'Phone', 'Role', 'Registered'], d.accounts.map((a) => [a.name, a.organisation, a.email, a.phone, a.role, a.createdAt]));
  else if (table === 'tickets') body = csv(['Request', 'Opened', 'Title', 'Equipment', 'Facility', 'Priority', 'Status', 'Engineer', 'Rating'], d.desk.tickets.map((t) => { const a = d.desk.assets.find((x) => x.id === t.assetId); return [t.id, t.openedAt, t.title, a?.name, a?.facility, t.priority, t.status, t.engineer, t.rating]; }));
  else if (table === 'equipment') body = csv(['Asset', 'Name', 'Brand', 'Serial', 'Facility', 'Location', 'Installed', 'Next calibration'], d.desk.assets.map((a) => [a.id, a.name, a.brand, a.serial, a.facility, a.location, a.installed, a.nextCalibration]));
  else return NextResponse.json({ error: 'Unknown table.' }, { status: 400 });
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="flokefama-${table}-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'private, no-store' } });
}
