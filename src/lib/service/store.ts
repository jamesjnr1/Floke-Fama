/**
 * The service desk shared by both portals: the client portal (hospitals) and the Biomedical
 * Engineer Service Portal. A request a client submits lands in the engineers' queue; every step an
 * engineer takes shows up live for the client, with a notification for the other side.
 *
 * DEMO DATA: facilities, people, serials and readings are fictional. The state lives in the browser
 * (localStorage, synced across tabs) so every action works and survives a reload.
 * In production the same actions call the service-management backend instead.
 */
import { useCallback, useEffect, useReducer, useState } from 'react';

export type Priority = 'critical' | 'high' | 'routine';
export type TicketStatus = 'new' | 'assigned' | 'travelling' | 'onsite' | 'resolved';
export type AssetStatus = 'online' | 'maintenance' | 'attention' | 'installing';

export interface LogEntry { at: string; by: string; text: string; kind: 'system' | 'note' | 'status' | 'part' }
export interface Part { name: string; qty: number }
export interface Certificate { id: string; date: string; result: 'Pass' | 'Adjusted'; engineer: string; notes?: string }

export interface Ticket {
  id: string;
  assetId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  openedAt: string;
  engineer?: string;
  eta?: string;
  log: LogEntry[];
  parts: Part[];
  resolution?: string;
  resolvedAt?: string;
  /** 'installation': delivery and commissioning of newly bought equipment (created by a purchase). */
  kind?: 'installation';
  /** Who raised it: a facility contact (client portal), an engineer, or the system (scheduled PM). */
  requestedBy?: string;
  contactPhone?: string;
  preferredVisit?: string;
  /** Client feedback after resolution. */
  rating?: number;
  feedback?: string;
}

export interface Asset {
  id: string;
  name: string;
  brand: string;
  productSlug?: string;
  image?: string;
  serial: string;
  facility: string;
  location: string;
  readings: number[];
  installed: string;
  warrantyUntil: string;
  lastCalibration: string;
  nextCalibration: string;
  intervalMonths: number;
  certificates: Certificate[];
  /** Set while newly bought equipment awaits delivery and installation (the order it came from). */
  installation?: { order: string };
}

export type Audience = 'engineer' | 'client';
export interface Notification { id: string; at: string; text: string; audience: Audience; ticketId?: string; assetId?: string; read: boolean }

export interface ServiceState {
  version: number;
  tickets: Ticket[];
  assets: Asset[];
  notifications: Notification[];
  /** Order references already turned into equipment, so a purchase is only registered once. */
  purchases?: string[];
}
/** @deprecated use ServiceState */
export type EngineerState = ServiceState;

/** Who is acting: decides who gets notified. */
export interface Actor { name: string; role: Audience; facility?: string }

/** The demo accounts (see src/lib/auth/users.ts). */
export const DEMO_ENGINEER = 'Kwame Boateng';
export const CLIENT_FACILITY = 'Demo Regional Hospital';

const VERSION = 5;
const KEY = 'ff-service-desk';

export const statusSteps: { status: TicketStatus; label: string }[] = [
  { status: 'new', label: 'Logged' },
  { status: 'assigned', label: 'Engineer assigned' },
  { status: 'travelling', label: 'En route' },
  { status: 'onsite', label: 'On-site diagnostics' },
  { status: 'resolved', label: 'Resolved' },
];
export const stepIndex = (s: TicketStatus) => statusSteps.findIndex((x) => x.status === s);

/** Step names as a hospital sees them. */
export const clientSteps: Record<TicketStatus, string> = {
  new: 'Received',
  assigned: 'Engineer assigned',
  travelling: 'Engineer en route',
  onsite: 'Engineer on site',
  resolved: 'Resolved',
};

/* ---------- dates ---------- */
const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, days: number) => new Date(base.getTime() + days * DAY);
export const addMonths = (base: Date, months: number) => { const d = new Date(base); d.setMonth(d.getMonth() + months); return d; };

export const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtTime = (s: string) => {
  const d = new Date(s);
  const today = new Date();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === addDays(today, -1).toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, ${time}`;
};
/** Whole calendar days from today to the date (negative when past). */
export const daysUntil = (s: string) => {
  const a = new Date(s);
  const b = new Date();
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / DAY);
};
export const dueLabel = (s: string) => {
  const d = daysUntil(s);
  if (d < 0) return `${-d} day${d === -1 ? '' : 's'} overdue`;
  if (d === 0) return 'Due today';
  return `Due in ${d} day${d === 1 ? '' : 's'}`;
};

/* ---------- derived ---------- */
/** The asset's photo: its own, else the catalogue photo of the product it is. */
export const assetImage = (a: Asset) => a.image ?? (a.productSlug ? `/images/products/${a.productSlug}.webp` : undefined);

export const isOpen = (t: Ticket) => t.status !== 'resolved';
export function assetStatus(asset: Asset, tickets: Ticket[]): AssetStatus {
  if (asset.installation) return 'installing';
  const open = tickets.filter((t) => t.assetId === asset.id && isOpen(t));
  if (open.some((t) => t.status === 'onsite')) return 'maintenance';
  if (open.some((t) => t.priority !== 'routine')) return 'attention';
  return 'online';
}

/* ---------- seed ---------- */
export function createSeed(now = new Date()): ServiceState {
  const me = DEMO_ENGINEER;
  const at = (days: number, h = 9, m = 0) => { const d = addDays(now, days); d.setHours(h, m, 0, 0); return iso(d); };
  const assets: Asset[] = [
    {
      id: 'AS-01', name: 'Semi-Auto Chemistry Analyser', brand: 'Mindray', productSlug: 'semi-automated-chemistry-analysermindray', serial: 'DEMO-SCA-0917',
      facility: 'Demo Regional Hospital', location: 'Main laboratory', readings: [42, 48, 45, 60, 58, 66, 71, 64, 72, 78],
      installed: at(-590), warrantyUntil: at(140), lastCalibration: at(-87), nextCalibration: at(3), intervalMonths: 3,
      certificates: [
        { id: 'CAL-0412', date: at(-87), result: 'Pass', engineer: 'Esi Mensah' },
        { id: 'CAL-0311', date: at(-178), result: 'Adjusted', engineer: 'Esi Mensah', notes: 'Lamp energy adjusted' },
      ],
    },
    {
      id: 'AS-02', name: 'BC-5150 Haematology Analyser', brand: 'Mindray', productSlug: 'auto-heamatology-analyzer-bc5150', serial: 'DEMO-BC5150-0442',
      facility: 'Demo Regional Hospital', location: 'Main laboratory', readings: [70, 66, 72, 61, 40, 38, 52, 35, 30, 33],
      installed: at(-830), warrantyUntil: at(-100), lastCalibration: at(-51), nextCalibration: at(41), intervalMonths: 3,
      certificates: [{ id: 'CAL-0447', date: at(-51), result: 'Pass', engineer: DEMO_ENGINEER }],
    },
    {
      id: 'AS-03', name: 'BC-30s Haematology Analyser', brand: 'Mindray', productSlug: 'haematology-analyzer-bc30s', serial: 'DEMO-BC30-2210',
      facility: 'Demo Polyclinic', location: 'Laboratory', readings: [55, 58, 52, 50, 49, 20, 18, 22, 25, 24],
      installed: at(-330), warrantyUntil: at(400), lastCalibration: at(-100), nextCalibration: at(-8), intervalMonths: 3,
      certificates: [{ id: 'CAL-0398', date: at(-100), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-04', name: 'CX23 Clinical Microscope', brand: 'Olympus', productSlug: 'microscope-olympus-cx23', image: '/images/products/microscope-olympus-cx23.webp', serial: 'DEMO-CX23-1180',
      facility: 'Demo Regional Hospital', location: 'Microbiology', readings: [30, 34, 33, 38, 36, 40, 39, 42, 41, 44],
      installed: at(-575), warrantyUntil: at(150), lastCalibration: at(-75), nextCalibration: at(107), intervalMonths: 6,
      certificates: [{ id: 'SRV-0420', date: at(-75), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-05', name: 'Autoclave Steriliser 50 L', brand: 'Flokefama', productSlug: 'autoclave-machine-50l', serial: 'DEMO-AC50-0078',
      facility: 'Demo Teaching Hospital', location: 'CSSD', readings: [60, 62, 61, 63, 60, 64, 65, 63, 66, 67],
      installed: at(-990), warrantyUntil: at(-260), lastCalibration: at(-17), nextCalibration: at(165), intervalMonths: 6,
      certificates: [{ id: 'VAL-0451', date: at(-17), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-06', name: 'Cardiotocography (CTG) Monitor', brand: 'Flokefama', productSlug: 'cardiotocography-machine-ctg', serial: 'DEMO-CTG-3301',
      facility: 'Demo Teaching Hospital', location: 'Maternity', readings: [48, 50, 47, 52, 51, 49, 53, 52, 54, 55],
      installed: at(-210), warrantyUntil: at(520), lastCalibration: at(-170), nextCalibration: at(12), intervalMonths: 6,
      certificates: [{ id: 'SRV-0377', date: at(-170), result: 'Pass', engineer: DEMO_ENGINEER }],
    },
  ];
  const sys = (text: string, when: string): LogEntry => ({ at: when, by: 'System', text, kind: 'system' });
  const tickets: Ticket[] = [
    {
      id: 'TK-1046', assetId: 'AS-06', title: 'CTG monitor: no fetal heart trace', description: 'Ultrasound transducer shows no signal on two beds.',
      priority: 'critical', status: 'new', openedAt: at(0, 8, 41), requestedBy: 'Maternity ward (Demo Teaching Hospital)',
      log: [sys('Request received from Maternity ward', at(0, 8, 41))], parts: [],
    },
    {
      id: 'TK-1044', assetId: 'AS-03', title: 'BC-30s: error on start-up', description: 'Analyser stops at self-test with a pressure error.',
      priority: 'high', status: 'onsite', openedAt: at(0, 7, 48), engineer: me, requestedBy: 'Laboratory (Demo Polyclinic)',
      log: [
        sys('Request received from Demo Polyclinic laboratory', at(0, 7, 48)),
        { at: at(0, 7, 55), by: me, text: 'Assigned to me', kind: 'status' },
        { at: at(0, 8, 5), by: me, text: 'En route · ETA 40 mins', kind: 'status' },
        { at: at(0, 8, 47), by: me, text: 'Arrived on site', kind: 'status' },
        { at: at(0, 9, 2), by: me, text: 'Vacuum chamber leak suspected; checking tubing and valves.', kind: 'note' },
      ],
      parts: [],
    },
    {
      id: 'TK-1042', assetId: 'AS-02', title: 'BC-5150: background count high', description: 'High background on start-up after reagent change.',
      priority: 'high', status: 'travelling', openedAt: at(0, 8, 12), engineer: 'Ama Kusi', eta: '45 mins', requestedBy: 'Lab Administrator',
      log: [
        sys('Request received from Demo Regional Hospital', at(0, 8, 12)),
        { at: at(0, 8, 20), by: 'Coordinator', text: 'Assigned to Ama Kusi · Korle-Bu branch', kind: 'status' },
        { at: at(0, 8, 31), by: 'Ama Kusi', text: 'En route · ETA 45 mins', kind: 'status' },
      ],
      parts: [],
    },
    {
      id: 'TK-1039', assetId: 'AS-01', title: 'Chemistry analyser: quarterly preventive maintenance', description: 'Scheduled preventive maintenance visit and calibration.',
      priority: 'routine', status: 'assigned', openedAt: at(-2, 9, 0), engineer: me, requestedBy: 'Scheduled maintenance plan',
      log: [sys('Scheduled preventive maintenance created', at(-2, 9, 0)), { at: at(-2, 9, 5), by: 'Coordinator', text: `Assigned to ${me}`, kind: 'status' }],
      parts: [],
    },
    {
      id: 'TK-1028', assetId: 'AS-04', title: 'CX23 microscope: coarse focus stiff', description: 'Coarse focus knob hard to turn; stage drifts.',
      priority: 'routine', status: 'resolved', openedAt: at(-30, 10, 0), engineer: 'Yaw Owusu', resolvedAt: at(-29, 14, 15), requestedBy: 'Lab Administrator',
      resolution: 'Focus mechanism cleaned and re-lubricated, tension adjusted, optics cleaned. Tested with the lab team.',
      rating: 5, feedback: 'Quick and thorough, thank you.',
      log: [sys('Request received from Demo Regional Hospital', at(-30, 10, 0)), { at: at(-29, 14, 15), by: 'Yaw Owusu', text: 'Resolved', kind: 'status' }],
      parts: [],
    },
    {
      id: 'TK-1031', assetId: 'AS-05', title: 'Autoclave: door seal replacement', description: 'Door seal worn; steam escaping during cycle.',
      priority: 'routine', status: 'resolved', openedAt: at(-18, 10, 0), engineer: 'Yaw Owusu', resolvedAt: at(-17, 15, 30), requestedBy: 'CSSD (Demo Teaching Hospital)',
      resolution: 'Door seal replaced, leak test and Bowie-Dick test passed, validation certificate issued.',
      log: [sys('Request received from CSSD', at(-18, 10, 0)), { at: at(-17, 15, 30), by: 'Yaw Owusu', text: 'Resolved', kind: 'status' }],
      parts: [{ name: 'Door seal (50 L)', qty: 1 }],
    },
  ];
  const notifications: Notification[] = [
    { id: 'N-3', audience: 'engineer', at: at(0, 8, 41), text: 'New critical request TK-1046 at Demo Teaching Hospital (Maternity).', ticketId: 'TK-1046', read: false },
    { id: 'N-2', audience: 'engineer', at: at(-1, 16, 10), text: 'BC-30s at Demo Polyclinic is 8 days past its calibration date.', assetId: 'AS-03', read: false },
    { id: 'N-1', audience: 'engineer', at: at(-2, 9, 5), text: 'You were assigned TK-1039: quarterly preventive maintenance.', ticketId: 'TK-1039', read: true },
    { id: 'C-2', audience: 'client', at: at(0, 8, 31), text: 'Ama Kusi is on the way for TK-1042 (BC-5150). ETA 45 mins.', ticketId: 'TK-1042', read: false },
    { id: 'C-1', audience: 'client', at: at(-1, 9, 0), text: 'Semi-Auto Chemistry Analyser is due for calibration in 3 days. Visit TK-1039 is booked.', assetId: 'AS-01', read: false },
  ];
  return { version: VERSION, tickets, assets, notifications };
}

/** The id the next logged ticket will get. */
/** A new id for equipment a facility registers itself. */
export const newAssetId = () => uidAsset();

export const nextTicketId = (s: ServiceState) => `TK-${Math.max(1000, ...s.tickets.map((t) => Number(t.id.split('-')[1]) || 0)) + 1}`;

/* ---------- actions ---------- */
export type Action =
  | { type: 'load'; state: ServiceState }
  | { type: 'assign'; id: string; engineer: string }
  | { type: 'travel'; id: string; eta: string }
  | { type: 'arrive'; id: string }
  | { type: 'note'; id: string; text: string }
  | { type: 'part'; id: string; part: Part }
  | { type: 'resolve'; id: string; summary: string; calibrated: boolean }
  | { type: 'create'; ticket: Pick<Ticket, 'assetId' | 'description' | 'priority'>; assignToMe: boolean }
  | { type: 'request'; ticket: Pick<Ticket, 'assetId' | 'description' | 'priority' | 'contactPhone' | 'preferredVisit'> }
  | { type: 'rate'; id: string; rating: number; feedback?: string }
  | { type: 'calibrate'; assetId: string; result: Certificate['result']; notes?: string }
  | { type: 'addAsset'; asset: Asset }
  | { type: 'purchase'; order: string; facility: string; items: { slug: string; name: string; brand: string; image?: string; qty: number }[] }
  | { type: 'read'; id: string }
  | { type: 'readAll'; audience: Audience };

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36).slice(-4).toUpperCase()}${(counter++).toString(36).toUpperCase()}`;
function uidAsset() { return uid('AS'); }

export function reducer(actor: Actor) {
  const me = actor.name;
  const other: Audience = actor.role === 'engineer' ? 'client' : 'engineer';
  return (state: ServiceState, action: Action): ServiceState => {
    const now = iso(new Date());
    const entry = (text: string, kind: LogEntry['kind'] = 'status'): LogEntry => ({ at: now, by: me, text, kind });
    const notify = (s: ServiceState, text: string, extra: Partial<Notification> = {}): ServiceState => ({
      ...s, notifications: [{ id: uid('N'), at: now, text, audience: other, read: false, ...extra }, ...s.notifications],
    });
    const patch = (id: string, fn: (t: Ticket) => Ticket): ServiceState => ({ ...state, tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)) });
    const ticket = 'id' in action ? state.tickets.find((t) => t.id === action.id) : undefined;
    const label = ticket ? `${ticket.id} (${ticket.title.split(':')[0]})` : '';

    switch (action.type) {
      case 'load':
        return action.state;
      case 'assign':
        return notify(patch(action.id, (t) => ({ ...t, status: 'assigned', engineer: action.engineer, log: [...t.log, entry(`Assigned to ${action.engineer}`)] })),
          `${action.engineer} has been assigned to ${label}.`, { ticketId: action.id });
      case 'travel':
        return notify(patch(action.id, (t) => ({ ...t, status: 'travelling', eta: action.eta, log: [...t.log, entry(`En route · ETA ${action.eta}`)] })),
          `${me} is on the way for ${label}. ETA ${action.eta}.`, { ticketId: action.id });
      case 'arrive':
        return notify(patch(action.id, (t) => ({ ...t, status: 'onsite', eta: undefined, log: [...t.log, entry('Arrived on site')] })),
          `${me} has arrived on site for ${label}.`, { ticketId: action.id });
      case 'note':
        return notify(patch(action.id, (t) => ({ ...t, log: [...t.log, entry(action.text, 'note')] })),
          `New message on ${label} from ${me}.`, { ticketId: action.id });
      case 'part':
        return patch(action.id, (t) => ({ ...t, parts: [...t.parts, action.part], log: [...t.log, entry(`Part used: ${action.part.qty} × ${action.part.name}`, 'part')] }));
      case 'resolve': {
        let next = patch(action.id, (t) => ({ ...t, status: 'resolved', resolution: action.summary, resolvedAt: now, log: [...t.log, entry('Resolved')] }));
        if (ticket?.kind === 'installation') {
          // Installed and commissioned: the warranty and the calibration schedule start today.
          const asset = next.assets.find((a) => a.id === ticket.assetId);
          const cert: Certificate = { id: `COM-${Math.floor(100 + Math.random() * 899)}`, date: now, result: 'Pass', engineer: me, notes: 'Installation and commissioning' };
          next = {
            ...next,
            assets: next.assets.map((a) =>
              a.id === ticket.assetId
                ? { ...a, installation: undefined, installed: now, warrantyUntil: iso(addMonths(new Date(), 12)), lastCalibration: now, nextCalibration: iso(addMonths(new Date(), a.intervalMonths)), certificates: [cert, ...a.certificates] }
                : a,
            ),
          };
          return notify(next, `${asset?.name ?? 'Your equipment'} is installed and commissioned. Its warranty runs for 12 months and the installation certificate is ready.`, { assetId: ticket.assetId });
        }
        if (action.calibrated && ticket) next = reducer(actor)(next, { type: 'calibrate', assetId: ticket.assetId, result: 'Pass', notes: `After ${ticket.id}` });
        return notify(next, `${label} is resolved. Your service report is ready, please rate the visit.`, { ticketId: action.id });
      }
      case 'create': {
        const asset = state.assets.find((a) => a.id === action.ticket.assetId);
        const id = nextTicketId(state);
        const t: Ticket = {
          id, ...action.ticket, title: `${asset?.name ?? 'System'}: ${action.ticket.description.split(/[.\n]/)[0].slice(0, 60)}`,
          status: action.assignToMe ? 'assigned' : 'new', engineer: action.assignToMe ? me : undefined, openedAt: now, parts: [], requestedBy: me,
          log: [entry(`Ticket logged by ${me}`, 'system'), ...(action.assignToMe ? [entry(`Assigned to ${me}`)] : [])],
        };
        return notify({ ...state, tickets: [t, ...state.tickets] }, `${id} opened for ${asset?.name ?? 'your system'}. An engineer is on it.`, { ticketId: id });
      }
      case 'request': {
        const asset = state.assets.find((a) => a.id === action.ticket.assetId);
        const id = nextTicketId(state);
        const t: Ticket = {
          id, ...action.ticket, title: `${asset?.name ?? 'System'}: ${action.ticket.description.split(/[.\n]/)[0].slice(0, 60)}`,
          status: 'new', openedAt: now, parts: [], requestedBy: me,
          log: [entry(`Request submitted by ${me}${action.ticket.preferredVisit ? ` · preferred visit: ${action.ticket.preferredVisit}` : ''}`, 'system')],
        };
        return notify({ ...state, tickets: [t, ...state.tickets] },
          `New ${action.ticket.priority} request ${id} from ${asset?.facility ?? actor.facility}: ${asset?.name ?? 'system'}.`, { ticketId: id });
      }
      case 'rate':
        return notify(patch(action.id, (t) => ({ ...t, rating: action.rating, feedback: action.feedback, log: [...t.log, entry(`Rated the service ${action.rating}/5${action.feedback ? `: “${action.feedback}”` : ''}`, 'note')] })),
          `${label} was rated ${action.rating}/5 by ${me}.`, { ticketId: action.id });
      case 'calibrate': {
        const assets = state.assets.map((a) => {
          if (a.id !== action.assetId) return a;
          const cert: Certificate = { id: `CAL-${Math.floor(500 + Math.random() * 499)}`, date: now, result: action.result, engineer: me, notes: action.notes };
          return { ...a, lastCalibration: now, nextCalibration: iso(addMonths(new Date(), a.intervalMonths)), certificates: [cert, ...a.certificates] };
        });
        const asset = state.assets.find((a) => a.id === action.assetId);
        return notify({ ...state, assets }, `New calibration certificate for ${asset?.name}.`, { assetId: action.assetId });
      }
      case 'purchase': {
        if (state.purchases?.includes(action.order)) return state;
        const assets: Asset[] = [];
        const tickets: Ticket[] = [];
        let n = Math.max(1000, ...state.tickets.map((t) => Number(t.id.split('-')[1]) || 0));
        for (const item of action.items)
          for (let k = 0; k < item.qty; k++) {
            const id = uid('AS');
            assets.push({
              id, name: item.name, brand: item.brand, productSlug: item.slug, image: item.image, serial: 'Recorded at installation',
              facility: action.facility, location: 'Set at installation', readings: [50, 52, 51, 53, 52, 54, 53, 55, 54, 56],
              installed: now, warrantyUntil: iso(addMonths(new Date(), 12)), lastCalibration: now, nextCalibration: iso(addMonths(new Date(), 6)),
              intervalMonths: 6, certificates: [], installation: { order: action.order },
            });
            n += 1;
            tickets.push({
              id: `TK-${n}`, assetId: id, kind: 'installation', title: `${item.name}: delivery, installation and commissioning`,
              description: `Deliver, install and commission the ${item.name} bought on order ${action.order}, then train the users.`,
              priority: 'routine', status: 'new', openedAt: now, parts: [], requestedBy: 'Flokefama sales',
              log: [{ at: now, by: 'System', text: `Installation booked from order ${action.order}`, kind: 'system' }],
            });
          }
        if (!assets.length) return { ...state, purchases: [...(state.purchases ?? []), action.order] };
        let next: ServiceState = { ...state, assets: [...state.assets, ...assets], tickets: [...tickets, ...state.tickets], purchases: [...(state.purchases ?? []), action.order] };
        next = notify(next, `${assets.length} new system${assets.length === 1 ? '' : 's'} to install at ${action.facility} (order ${action.order}).`, { ticketId: tickets[0].id });
        // Tell the hospital too
        return { ...next, notifications: [{ id: uid('N'), at: now, text: `Order ${action.order}: ${assets.length === 1 ? assets[0].name : `${assets.length} systems`} added to your equipment. Our engineers will deliver, install and commission ${assets.length === 1 ? 'it' : 'them'}.`, audience: 'client', read: false, ticketId: tickets[0].id }, ...next.notifications] };
      }
      case 'addAsset':
        return notify({ ...state, assets: [...state.assets, action.asset] },
          `${action.asset.facility} registered ${action.asset.name} (${action.asset.location}).`, { assetId: action.asset.id });
      case 'read':
        return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
      case 'readAll':
        return { ...state, notifications: state.notifications.map((n) => (n.audience === action.audience ? { ...n, read: true } : n)) };
    }
  };
}

/**
 * Service-desk state, persisted in the browser and synced between tabs, so a request submitted in
 * the client portal appears in an open engineer portal (and back). `ready` is false until the saved
 * state is loaded (avoids a hydration mismatch).
 */
export function useServiceStore(actor: Actor) {
  const [state, dispatch] = useReducer(reducer(actor), undefined, () => createSeed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as ServiceState | null;
        dispatch({ type: 'load', state: saved?.version === VERSION ? saved : createSeed() });
      } catch {
        /* storage unavailable: run on the in-memory seed */
      }
    };
    read();
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && read();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (localStorage.getItem(KEY) !== JSON.stringify(state)) localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const reset = useCallback(() => dispatch({ type: 'load', state: createSeed() }), []);
  return { state, dispatch, ready, reset };
}

/** Engineer portal entry point. */
export const useEngineerStore = (me: string) => useServiceStore({ name: me, role: 'engineer' });
