/**
 * Biomedical Engineer Service Portal: state, demo seed and actions.
 *
 * DEMO DATA: facilities, people, serials and readings are fictional. The state lives in the
 * engineer's browser (localStorage) so every action in the portal works and survives a reload.
 * In production the same actions call the service-management backend instead.
 */
import { useCallback, useEffect, useReducer, useState } from 'react';

export type Priority = 'critical' | 'high' | 'routine';
export type TicketStatus = 'new' | 'assigned' | 'travelling' | 'onsite' | 'resolved';
export type AssetStatus = 'online' | 'maintenance' | 'attention';

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
}

export interface Notification { id: string; at: string; text: string; ticketId?: string; assetId?: string; read: boolean }

export interface EngineerState { version: number; tickets: Ticket[]; assets: Asset[]; notifications: Notification[] }

const VERSION = 3;
const KEY = 'ff-engineer-portal';

export const statusSteps: { status: TicketStatus; label: string }[] = [
  { status: 'new', label: 'Logged' },
  { status: 'assigned', label: 'Engineer assigned' },
  { status: 'travelling', label: 'En route' },
  { status: 'onsite', label: 'On-site diagnostics' },
  { status: 'resolved', label: 'Resolved' },
];
export const stepIndex = (s: TicketStatus) => statusSteps.findIndex((x) => x.status === s);

/* ---------- dates ---------- */
const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, days: number) => new Date(base.getTime() + days * DAY);
const addMonths = (base: Date, months: number) => { const d = new Date(base); d.setMonth(d.getMonth() + months); return d; };

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
export const isOpen = (t: Ticket) => t.status !== 'resolved';
export function assetStatus(asset: Asset, tickets: Ticket[]): AssetStatus {
  const open = tickets.filter((t) => t.assetId === asset.id && isOpen(t));
  if (open.some((t) => t.status === 'onsite')) return 'maintenance';
  if (open.some((t) => t.priority !== 'routine')) return 'attention';
  return 'online';
}

/* ---------- seed ---------- */
export function createSeed(me: string, now = new Date()): EngineerState {
  const at = (days: number, h = 9, m = 0) => { const d = addDays(now, days); d.setHours(h, m, 0, 0); return iso(d); };
  const assets: Asset[] = [
    {
      id: 'AS-01', name: 'Semi-Auto Chemistry Analyser', brand: 'Mindray', productSlug: 'mindray-semi-auto-chemistry', serial: 'DEMO-SCA-0917',
      facility: 'Demo Regional Hospital', location: 'Main laboratory', readings: [42, 48, 45, 60, 58, 66, 71, 64, 72, 78],
      installed: at(-590), warrantyUntil: at(140), lastCalibration: at(-87), nextCalibration: at(3), intervalMonths: 3,
      certificates: [
        { id: 'CAL-0412', date: at(-87), result: 'Pass', engineer: 'Esi Mensah' },
        { id: 'CAL-0311', date: at(-178), result: 'Adjusted', engineer: 'Esi Mensah', notes: 'Lamp energy adjusted' },
      ],
    },
    {
      id: 'AS-02', name: 'BC-5150 Haematology Analyser', brand: 'Mindray', productSlug: 'mindray-bc-5150', serial: 'DEMO-BC5150-0442',
      facility: 'Demo Regional Hospital', location: 'Main laboratory', readings: [70, 66, 72, 61, 40, 38, 52, 35, 30, 33],
      installed: at(-830), warrantyUntil: at(-100), lastCalibration: at(-51), nextCalibration: at(41), intervalMonths: 3,
      certificates: [{ id: 'CAL-0447', date: at(-51), result: 'Pass', engineer: me }],
    },
    {
      id: 'AS-03', name: 'BC-30s Haematology Analyser', brand: 'Mindray', productSlug: 'mindray-bc-30s', serial: 'DEMO-BC30-2210',
      facility: 'Demo Polyclinic', location: 'Laboratory', readings: [55, 58, 52, 50, 49, 20, 18, 22, 25, 24],
      installed: at(-330), warrantyUntil: at(400), lastCalibration: at(-100), nextCalibration: at(-8), intervalMonths: 3,
      certificates: [{ id: 'CAL-0398', date: at(-100), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-04', name: 'CX23 Clinical Microscope', brand: 'Olympus', productSlug: 'olympus-cx23', image: '/images/products/olympus-cx23.webp', serial: 'DEMO-CX23-1180',
      facility: 'Demo Regional Hospital', location: 'Microbiology', readings: [30, 34, 33, 38, 36, 40, 39, 42, 41, 44],
      installed: at(-575), warrantyUntil: at(150), lastCalibration: at(-75), nextCalibration: at(107), intervalMonths: 6,
      certificates: [{ id: 'SRV-0420', date: at(-75), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-05', name: 'Autoclave Steriliser 50 L', brand: 'Flokefama', productSlug: 'autoclave-range', serial: 'DEMO-AC50-0078',
      facility: 'Demo Teaching Hospital', location: 'CSSD', readings: [60, 62, 61, 63, 60, 64, 65, 63, 66, 67],
      installed: at(-990), warrantyUntil: at(-260), lastCalibration: at(-17), nextCalibration: at(165), intervalMonths: 6,
      certificates: [{ id: 'VAL-0451', date: at(-17), result: 'Pass', engineer: 'Yaw Owusu' }],
    },
    {
      id: 'AS-06', name: 'Cardiotocography (CTG) Monitor', brand: 'Flokefama', productSlug: 'ctg-machine', serial: 'DEMO-CTG-3301',
      facility: 'Demo Teaching Hospital', location: 'Maternity', readings: [48, 50, 47, 52, 51, 49, 53, 52, 54, 55],
      installed: at(-210), warrantyUntil: at(520), lastCalibration: at(-170), nextCalibration: at(12), intervalMonths: 6,
      certificates: [{ id: 'SRV-0377', date: at(-170), result: 'Pass', engineer: me }],
    },
  ];
  const sys = (text: string, when: string): LogEntry => ({ at: when, by: 'System', text, kind: 'system' });
  const tickets: Ticket[] = [
    {
      id: 'TK-1046', assetId: 'AS-06', title: 'CTG monitor: no fetal heart trace', description: 'Ultrasound transducer shows no signal on two beds.',
      priority: 'critical', status: 'new', openedAt: at(0, 8, 41), log: [sys('Ticket logged by Maternity ward', at(0, 8, 41))], parts: [],
    },
    {
      id: 'TK-1044', assetId: 'AS-03', title: 'BC-30s: error on start-up', description: 'Analyser stops at self-test with a pressure error.',
      priority: 'high', status: 'onsite', openedAt: at(0, 7, 48), engineer: me,
      log: [
        sys('Ticket logged by Demo Polyclinic laboratory', at(0, 7, 48)),
        { at: at(0, 7, 55), by: me, text: 'Assigned to me', kind: 'status' },
        { at: at(0, 8, 5), by: me, text: 'En route · ETA 40 mins', kind: 'status' },
        { at: at(0, 8, 47), by: me, text: 'Arrived on site', kind: 'status' },
        { at: at(0, 9, 2), by: me, text: 'Vacuum chamber leak suspected; checking tubing and valves.', kind: 'note' },
      ],
      parts: [],
    },
    {
      id: 'TK-1042', assetId: 'AS-02', title: 'BC-5150: background count high', description: 'High background on start-up after reagent change.',
      priority: 'high', status: 'travelling', openedAt: at(0, 8, 12), engineer: 'Ama Kusi', eta: '45 mins',
      log: [sys('Ticket logged by Demo Regional Hospital', at(0, 8, 12)), { at: at(0, 8, 20), by: 'Coordinator', text: 'Assigned to Ama Kusi · Korle-Bu branch', kind: 'status' }],
      parts: [],
    },
    {
      id: 'TK-1039', assetId: 'AS-01', title: 'Chemistry analyser: quarterly preventive maintenance', description: 'Scheduled PM visit and calibration.',
      priority: 'routine', status: 'assigned', openedAt: at(-2, 9, 0), engineer: me,
      log: [sys('Scheduled preventive maintenance created', at(-2, 9, 0)), { at: at(-2, 9, 5), by: 'Coordinator', text: `Assigned to ${me}`, kind: 'status' }],
      parts: [],
    },
    {
      id: 'TK-1031', assetId: 'AS-05', title: 'Autoclave: door seal replacement', description: 'Door seal worn; steam escaping during cycle.',
      priority: 'routine', status: 'resolved', openedAt: at(-18, 10, 0), engineer: 'Yaw Owusu', resolvedAt: at(-17, 15, 30),
      resolution: 'Door seal replaced, leak test and Bowie-Dick test passed, validation certificate issued.',
      log: [sys('Ticket logged by CSSD', at(-18, 10, 0)), { at: at(-17, 15, 30), by: 'Yaw Owusu', text: 'Resolved', kind: 'status' }],
      parts: [{ name: 'Door seal (50 L)', qty: 1 }],
    },
  ];
  const notifications: Notification[] = [
    { id: 'N-3', at: at(0, 8, 41), text: 'New critical ticket TK-1046 at Demo Teaching Hospital (Maternity).', ticketId: 'TK-1046', read: false },
    { id: 'N-2', at: at(-1, 16, 10), text: 'BC-30s at Demo Polyclinic is 8 days past its calibration date.', assetId: 'AS-03', read: false },
    { id: 'N-1', at: at(-2, 9, 5), text: 'You were assigned TK-1039: quarterly preventive maintenance.', ticketId: 'TK-1039', read: true },
  ];
  return { version: VERSION, tickets, assets, notifications };
}

/** The id the next logged ticket will get. */
export const nextTicketId = (s: EngineerState) => `TK-${Math.max(1000, ...s.tickets.map((t) => Number(t.id.split('-')[1]) || 0)) + 1}`;

/* ---------- actions ---------- */
export type Action =
  | { type: 'load'; state: EngineerState }
  | { type: 'assign'; id: string; engineer: string }
  | { type: 'travel'; id: string; eta: string }
  | { type: 'arrive'; id: string }
  | { type: 'note'; id: string; text: string }
  | { type: 'part'; id: string; part: Part }
  | { type: 'resolve'; id: string; summary: string; calibrated: boolean }
  | { type: 'create'; ticket: Pick<Ticket, 'assetId' | 'description' | 'priority'>; assignToMe: boolean }
  | { type: 'calibrate'; assetId: string; result: Certificate['result']; notes?: string }
  | { type: 'read'; id: string }
  | { type: 'readAll' };

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36).slice(-4).toUpperCase()}${(counter++).toString(36).toUpperCase()}`;

export function reducer(me: string) {
  return (state: EngineerState, action: Action): EngineerState => {
    const now = iso(new Date());
    const entry = (text: string, kind: LogEntry['kind'] = 'status'): LogEntry => ({ at: now, by: me, text, kind });
    const notify = (s: EngineerState, text: string, extra: Partial<Notification> = {}): EngineerState => ({
      ...s, notifications: [{ id: uid('N'), at: now, text, read: false, ...extra }, ...s.notifications],
    });
    const patch = (id: string, fn: (t: Ticket) => Ticket): EngineerState => ({ ...state, tickets: state.tickets.map((t) => (t.id === id ? fn(t) : t)) });

    switch (action.type) {
      case 'load':
        return action.state;
      case 'assign':
        return patch(action.id, (t) => ({ ...t, status: 'assigned', engineer: action.engineer, log: [...t.log, entry(`Assigned to ${action.engineer}`)] }));
      case 'travel':
        return patch(action.id, (t) => ({ ...t, status: 'travelling', eta: action.eta, log: [...t.log, entry(`En route · ETA ${action.eta}`)] }));
      case 'arrive':
        return patch(action.id, (t) => ({ ...t, status: 'onsite', eta: undefined, log: [...t.log, entry('Arrived on site')] }));
      case 'note':
        return patch(action.id, (t) => ({ ...t, log: [...t.log, entry(action.text, 'note')] }));
      case 'part':
        return patch(action.id, (t) => ({ ...t, parts: [...t.parts, action.part], log: [...t.log, entry(`Part used: ${action.part.qty} × ${action.part.name}`, 'part')] }));
      case 'resolve': {
        const ticket = state.tickets.find((t) => t.id === action.id);
        let next = patch(action.id, (t) => ({ ...t, status: 'resolved', resolution: action.summary, resolvedAt: now, log: [...t.log, entry('Resolved')] }));
        if (action.calibrated && ticket) next = reducer(me)(next, { type: 'calibrate', assetId: ticket.assetId, result: 'Pass', notes: `After ${ticket.id}` });
        return notify(next, `${action.id} resolved. Service report sent to the facility.`, { ticketId: action.id, read: true });
      }
      case 'create': {
        const asset = state.assets.find((a) => a.id === action.ticket.assetId);
        const id = nextTicketId(state);
        const ticket: Ticket = {
          id, ...action.ticket, title: `${asset?.name ?? 'System'}: ${action.ticket.description.split(/[.\n]/)[0].slice(0, 60)}`,
          status: action.assignToMe ? 'assigned' : 'new', engineer: action.assignToMe ? me : undefined, openedAt: now, parts: [],
          log: [entry(`Ticket logged by ${me}`, 'system'), ...(action.assignToMe ? [entry(`Assigned to ${me}`)] : [])],
        };
        return notify({ ...state, tickets: [ticket, ...state.tickets] }, `${id} logged for ${asset?.name ?? 'system'}.`, { ticketId: id, read: true });
      }
      case 'calibrate': {
        const assets = state.assets.map((a) => {
          if (a.id !== action.assetId) return a;
          const cert: Certificate = { id: `CAL-${Math.floor(500 + Math.random() * 499)}`, date: now, result: action.result, engineer: me, notes: action.notes };
          return { ...a, lastCalibration: now, nextCalibration: iso(addMonths(new Date(), a.intervalMonths)), certificates: [cert, ...a.certificates] };
        });
        const asset = state.assets.find((a) => a.id === action.assetId);
        return notify({ ...state, assets }, `Calibration recorded for ${asset?.name}. Certificate issued.`, { assetId: action.assetId, read: true });
      }
      case 'read':
        return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
      case 'readAll':
        return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    }
  };
}

/** Portal state, persisted per browser. `ready` is false until the saved state is loaded (avoids a hydration mismatch). */
export function useEngineerStore(me: string) {
  const [state, dispatch] = useReducer(reducer(me), undefined, () => createSeed(me));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as EngineerState | null;
      if (saved?.version === VERSION) dispatch({ type: 'load', state: saved });
      else dispatch({ type: 'load', state: createSeed(me) });
    } catch {
      /* storage unavailable: run on the in-memory seed */
    }
    setReady(true);
  }, [me]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const reset = useCallback(() => dispatch({ type: 'load', state: createSeed(me) }), [me]);
  return { state, dispatch, ready, reset };
}
