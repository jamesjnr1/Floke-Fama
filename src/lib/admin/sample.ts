import 'server-only';
import { catalogue } from '@/data/catalogue';
import type { AdminData } from '@/lib/admin/data';
import type { OrderStatus } from '@/lib/orders';
import type { Asset, Priority, Ticket, TicketStatus } from '@/lib/service/desk';

/**
 * Made-up rows for previewing the admin console on a computer without Appwrite (ADMIN_SAMPLE_DATA=true, never in
 * production). Always the same rows, so screenshots are repeatable.
 */
export function sampleData(): AdminData {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  const now = Date.UTC(2026, 9, 19, 12);
  const daysAgo = (d: number) => new Date(now - d * 864e5 - Math.floor(rnd() * 864e5)).toISOString();

  const facilities = ['Korle-Bu Teaching Hospital', 'Ridge Hospital', 'Komfo Anokye Teaching Hospital', 'Cape Coast Teaching Hospital', 'Nyaho Medical Centre', 'Lister Hospital', 'Trust Hospital Osu', 'Tamale Teaching Hospital', 'Holy Family Hospital Techiman', 'Euracare Advanced Diagnostic'];
  const regions = ['Greater Accra', 'Ashanti', 'Central', 'Northern', 'Western', 'Volta', 'Bono'];
  const people = ['Ama Mensah', 'Kwame Boateng', 'Esi Owusu', 'Kofi Asante', 'Abena Darko', 'Yaw Ofori', 'Akosua Appiah', 'Kojo Antwi', 'Adwoa Sarpong', 'Nana Agyeman', 'Efua Quansah', 'Kwabena Osei'];

  const accounts = Array.from({ length: 46 }, (_, i) => {
    const name = pick(people);
    const organisation = facilities[i % facilities.length];
    return { id: `hos-${(1000 + i).toString(16)}`, name, email: `${name.split(' ')[0].toLowerCase()}${i}@${organisation.split(' ')[0].toLowerCase()}.org`, organisation, phone: `+233 24 ${String(1000000 + i * 7919).slice(-7)}`, role: 'client', createdAt: daysAgo(Math.floor(rnd() * 170)) };
  });
  const engineers = ['Samuel Tetteh', 'Joseph Nkrumah', 'Daniel Owusu', 'Grace Mensah'];
  engineers.forEach((name, i) =>
    accounts.push({ id: `eng-${i + 1}`, name, email: `${name.split(' ')[0].toLowerCase()}@flokefama.com`, organisation: 'Flokefama', phone: `+233 53 339 ${2860 + i}`, role: 'engineer', createdAt: daysAgo(160 + i * 20) }),
  );

  const popular = catalogue.slice(0, 30);
  const statuses: OrderStatus[] = ['awaiting-payment', 'paid', 'processing', 'delivered', 'delivered', 'delivered'];
  const orders = Array.from({ length: 64 }, (_, i) => {
    const a = pick(accounts.slice(0, 46));
    const age = Math.floor(rnd() * rnd() * 84);
    const items = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => {
      const p = pick(popular.slice(0, 8 + Math.floor(rnd() * 22)));
      return { slug: p.slug, name: p.name, qty: 1 + Math.floor(rnd() * rnd() * 4) };
    });
    const placedAt = daysAgo(age);
    return { reference: `FF-${(0x5a3f1 + i * 977).toString(36).toUpperCase()}`, placedAt, createdAt: placedAt, account: a.email, items, method: pick(['momo', 'momo', 'bank', 'card'] as const), region: pick(regions), address: `${a.organisation}, ${pick(regions)}`, status: age < 3 ? 'awaiting-payment' : pick(statuses) };
  }).sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  const assets: Asset[] = Array.from({ length: 38 }, (_, i) => {
    const p = pick(popular);
    return { id: `AS-${2001 + i}`, name: p.name, brand: p.brand ?? 'Mindray', productSlug: p.slug, serial: `SN${(83421 + i * 37).toString()}`, facility: facilities[i % facilities.length], location: pick(['Laboratory', 'ICU', 'Theatre 2', 'Radiology', 'Maternity']), readings: [], installed: daysAgo(400), warrantyUntil: daysAgo(-300), lastCalibration: daysAgo(120), nextCalibration: daysAgo(-60 + Math.floor(rnd() * 90)), intervalMonths: 6, certificates: [] };
  });
  const tStatus: TicketStatus[] = ['new', 'resolved', 'resolved', 'resolved', 'resolved'];
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 6e4).toISOString();
  const tickets: Ticket[] = Array.from({ length: 27 }, (_, i) => {
    const a = pick(assets);
    const status = pick(tStatus);
    return { id: `TK-${1043 + i}`, assetId: a.id, title: pick(['Error code on start-up', 'Calibration due', 'Screen not responding', 'Installation and commissioning', 'Printer jam', 'Abnormal readings']), description: '', priority: pick(['routine', 'routine', 'high', 'critical'] as Priority[]), status, openedAt: daysAgo(3 + Math.floor(rnd() * 40)), engineer: status === 'new' ? undefined : pick(engineers.slice(0, 3)), log: [], parts: [], requestedBy: pick(people), rating: status === 'resolved' && rnd() > 0.4 ? 4 + Math.round(rnd()) : undefined };
  });
  // Today's jobs, so the live view has engineers on site, en route and assigned
  const today: [string, TicketStatus, number, string][] = [
    ['Samuel Tetteh', 'onsite', 42, 'Error code on start-up'],
    ['Joseph Nkrumah', 'travelling', 18, 'Abnormal readings'],
    ['Daniel Owusu', 'assigned', 65, 'Calibration due'],
    ['Samuel Tetteh', 'assigned', 30, 'Printer jam'],
  ];
  today.forEach(([engineer, status, minutes, title], i) => {
    const a = assets[i * 3];
    const log = [
      { at: at(minutes + 120), by: 'System', text: `Assigned to ${engineer}`, kind: 'system' as const },
      ...(status !== 'assigned' ? [{ at: at(status === 'onsite' ? minutes + 35 : minutes), by: engineer, text: 'En route', kind: 'status' as const }] : []),
      ...(status === 'onsite' ? [{ at: at(minutes), by: engineer, text: 'Arrived on site', kind: 'status' as const }] : []),
    ];
    if (status === 'assigned') log[0].at = at(minutes);
    tickets.push({ id: `TK-${1100 + i}`, assetId: a.id, title, description: '', priority: i === 0 ? 'critical' : 'high', status, openedAt: at(minutes + 180), engineer, eta: status === 'travelling' ? '13:20' : undefined, log, parts: [], requestedBy: pick(people) });
  });
  tickets.sort((a, b) => b.openedAt.localeCompare(a.openedAt));

  return {
    source: 'sample',
    accounts: accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    orders,
    desk: { assets, tickets, notifications: [] },
    pushSubscriptions: 19,
    tables: [
      { table: 'accounts', label: 'Accounts', ok: true, rows: accounts.length },
      { table: 'orders', label: 'Orders', ok: true, rows: orders.length },
      { table: 'push_subscriptions', label: 'Push subscriptions', ok: true, rows: 19 },
      { table: 'service_*', label: 'Service desk (equipment, requests, notifications)', ok: true, rows: assets.length + tickets.length },
    ],
  };
}
