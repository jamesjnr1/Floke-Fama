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
  const statuses: OrderStatus[] = ['called', 'priced', 'priced', 'paid', 'processing', 'delivered', 'delivered', 'delivered', 'delivered', 'lost'];
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
    pictures: {},
    supportRequests: [
      { id: 'SR-MH4Q2K1A', at: new Date(now - 25 * 60_000).toISOString(), status: 'new', type: 'fault', name: 'Esi Owusu', facility: 'Tamale Teaching Hospital', phone: '+233 24 555 0192', equipment: 'Mindray BS-240 Chemistry Analyzer', serial: 'BS24-08817', working: 'down', message: 'Error 2-31 on start-up. The analyser will not run samples.' },
      { id: 'SR-MH4N8Z3C', at: new Date(now - 3 * 3600_000).toISOString(), status: 'called', handledBy: 'Samuel Tetteh', type: 'maintenance', name: 'Kojo Antwi', facility: 'Holy Family Hospital Techiman', phone: '+233 20 441 7781', equipment: 'Patient monitors in the ICU', units: '6', lastService: '2026-04-12', preferredDate: '2026-10-28', message: 'Calibration certificates are due for renewal.' },
      { id: 'SR-MH2B7T9E', at: new Date(now - 2 * 864e5).toISOString(), status: 'closed', handledBy: 'Grace Mensah', ticketId: 'TK-1066', type: 'installation', name: 'Adwoa Sarpong', facility: 'Nyaho Medical Centre', phone: '+233 55 210 3349', equipment: 'Autoclave 35L', order: 'FF-5A3F1', location: 'Main theatre, 2nd floor', preferredDate: '2026-10-22', message: 'Delivered last week; power and water points are ready.' },
    ],
    sms: [
      { id: 's5', at: new Date(now - 6 * 60_000).toISOString(), kind: 'urgent', ref: 'TK-1061', to: '233533392860,233533392861,233533392862,233533392863', text: 'FLOKEFAMA: CRITICAL fault at Ridge Hospital - BC-5150 Haematology Analyzer. Job TK-1061 needs an engineer. Open: https://flokefama.com/engineer?ticket=TK-1061', status: 'sent', detail: 'Arkesel' },
      { id: 's4', at: new Date(now - 41 * 60_000).toISOString(), kind: 'escalation', ref: 'TK-1058', to: '233244000111', text: 'FLOKEFAMA: No engineer has taken HIGH job TK-1058 at Lister Hospital - Patient Monitor after 30 min. Open: https://flokefama.com/admin?tab=service', status: 'sent', detail: 'Arkesel' },
      { id: 's3', at: new Date(now - 95 * 60_000).toISOString(), kind: 'message', ref: 'TK-1052', to: '233533392861', text: 'FLOKEFAMA: New message from Korle-Bu Teaching Hospital on job TK-1052 (CT Scanner). Open: https://flokefama.com/engineer?ticket=TK-1052', status: 'sent', detail: 'Arkesel' },
      { id: 's2', at: new Date(now - 3 * 3600_000).toISOString(), kind: 'assigned', ref: 'TK-1049', to: '233533392862', text: 'FLOKEFAMA: Job TK-1049 at Nyaho Medical Centre - Ultrasound System is now yours (routine). Open: https://flokefama.com/engineer?ticket=TK-1049', status: 'failed', detail: 'Arkesel: insufficient balance' },
    ],
    tables: [
      { table: 'accounts', label: 'Accounts', ok: true, rows: accounts.length },
      { table: 'orders', label: 'Orders', ok: true, rows: orders.length },
      { table: 'push_subscriptions', label: 'Push subscriptions', ok: true, rows: 19 },
      { table: 'service_*', label: 'Service desk (equipment, requests, notifications)', ok: true, rows: assets.length + tickets.length },
    ],
  };
}
