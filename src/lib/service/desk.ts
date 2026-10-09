/**
 * The service desk shared by both portals: the client portal (hospitals) and the Biomedical
 * Engineer Service Portal. A request a client submits lands in the engineers' queue; every step an
 * engineer takes shows up live for the client, with a notification for the other side.
 *
 * This file is the desk's data and rules (no React), used by the portals (lib/service/store.ts) and, when Appwrite
 * is set up, by the server that keeps the desk for everyone (lib/service/server.ts).
 */

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

export const VERSION = 6; // 6: the demo equipment and requests were removed

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

/* ---------- start ---------- */
/** A new desk starts empty: equipment, requests and notifications come from real accounts. */
export function createSeed(): ServiceState {
  return { version: VERSION, tickets: [], assets: [], notifications: [] };
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
  | { type: 'purchase'; order: string; facility: string; items: { slug: string; name: string; brand: string; image?: string; qty: number; install: boolean }[] }
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
            // Ready-to-use equipment (BP monitors, diagnostic sets, beds…) goes straight into service on delivery;
            // the rest waits for an engineer to install and commission it.
            assets.push({
              id, name: item.name, brand: item.brand, productSlug: item.slug, image: item.image,
              serial: item.install ? 'Recorded at installation' : 'On the delivery note',
              facility: action.facility, location: item.install ? 'Set at installation' : 'Location not set', readings: [50, 52, 51, 53, 52, 54, 53, 55, 54, 56],
              installed: now, warrantyUntil: iso(addMonths(new Date(), 12)), lastCalibration: now, nextCalibration: iso(addMonths(new Date(), item.install ? 6 : 12)),
              intervalMonths: item.install ? 6 : 12, certificates: [], ...(item.install ? { installation: { order: action.order } } : {}),
            });
            if (!item.install) continue;
            n += 1;
            tickets.push({
              id: `TK-${n}`, assetId: id, kind: 'installation', title: `${item.name}: delivery, installation and commissioning`,
              description: `Deliver, install and commission the ${item.name} bought on order ${action.order}, then train the users.`,
              priority: 'routine', status: 'new', openedAt: now, parts: [], requestedBy: 'Flokefama sales',
              log: [{ at: now, by: 'System', text: `Installation booked from order ${action.order}`, kind: 'system' }],
            });
          }
        const purchases = [...(state.purchases ?? []), action.order];
        if (!assets.length) return { ...state, purchases };
        let next: ServiceState = { ...state, assets: [...state.assets, ...assets], tickets: [...tickets, ...state.tickets], purchases };
        if (tickets.length)
          next = notify(next, `${tickets.length} new system${tickets.length === 1 ? '' : 's'} to install at ${action.facility} (order ${action.order}).`, { ticketId: tickets[0].id });
        // Tell the hospital too
        const ready = assets.length - tickets.length;
        const what = assets.length === 1 ? assets[0].name : `${assets.length} items`;
        const text = !tickets.length
          ? `Order ${action.order}: ${what} added to your equipment, ready to use on delivery.`
          : !ready
            ? `Order ${action.order}: ${what} added to your equipment. Our engineers will deliver, install and commission ${assets.length === 1 ? 'it' : 'them'}.`
            : `Order ${action.order}: ${what} added to your equipment. ${ready} ${ready === 1 ? 'is' : 'are'} ready to use on delivery; our engineers will install and commission ${tickets.length === 1 ? `the ${assets.find((a) => a.installation)?.name}` : `the other ${tickets.length}`}.`;
        return { ...next, notifications: [{ id: uid('N'), at: now, text, audience: 'client', read: false, ...(tickets[0] ? { ticketId: tickets[0].id } : { assetId: assets[0].id }) }, ...next.notifications] };
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
