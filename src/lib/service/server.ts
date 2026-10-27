import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import type { SessionUser } from '@/lib/auth/session';
import { catalogue } from '@/data/catalogue';
import { pushNew } from '@/lib/push';
import { escalateStale, smsNew } from '@/lib/sms';
import { canonicalFacility } from '@/lib/service/facilities';
import { supportDetails, type SupportInput } from '@/lib/support-schema';
import { createSeed, facilityKey, reducer, type Action, type Actor, type Asset, type Notification, type ServiceState, type Ticket } from '@/lib/service/desk';

/**
 * The service desk kept in Appwrite: one row per piece of equipment, request and notification, each holding
 * the item as JSON (`data`) plus the columns used to find it. The browser never writes rows itself: it sends
 * an action, the server checks the account may take it, applies it with the same reducer the portals use
 * (with the signed-in account as the actor) and saves only what changed.
 */
type Row = Models.Row & { data: string };
type Kind = 'assets' | 'tickets' | 'notifications';
const tableOf: Record<Kind, string> = { assets: TABLES.serviceAssets, tickets: TABLES.serviceTickets, notifications: TABLES.serviceNotifications };

async function listAll(tableId: string) {
  const rows: Row[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await appwrite!.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId, queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
    rows.push(...page.rows);
    if (page.rows.length < 500) return rows;
    cursor = page.rows[page.rows.length - 1].$id;
  }
}

const parse = <T>(rows: Row[]) => rows.flatMap((r) => { try { return [JSON.parse(r.data) as T]; } catch { return []; } });

/** The whole desk, newest requests and notifications first. */
export async function loadDesk(): Promise<ServiceState> {
  const [assets, tickets, notifications] = await Promise.all([listAll(tableOf.assets), listAll(tableOf.tickets), listAll(tableOf.notifications)]);
  return {
    ...createSeed(),
    assets: parse<Asset>(assets).sort((a, b) => a.id.localeCompare(b.id)),
    tickets: parse<Ticket>(tickets).sort((a, b) => b.openedAt.localeCompare(a.openedAt)),
    notifications: parse<Notification>(notifications).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 200),
  };
}

/** Extra columns kept next to the JSON, so rows can be looked up without opening them. */
const columns = (kind: Kind, item: Asset | Ticket | Notification, state: ServiceState) => {
  if (kind === 'assets') return { facility: (item as Asset).facility };
  if (kind === 'tickets') return { facility: state.assets.find((a) => a.id === (item as Ticket).assetId)?.facility ?? '' };
  return { audience: (item as Notification).audience };
};

/**
 * Saves what an action changed. New items are created (so two people can never claim the same id) and changed ones
 * updated. Requests go first: if a new request's id was just taken, nothing else has been written yet.
 */
async function saveChanges(before: ServiceState, after: ServiceState) {
  for (const kind of ['tickets', 'assets', 'notifications'] as const) {
    const writes: Promise<unknown>[] = [];
    const old = new Map((before[kind] as { id: string }[]).map((x) => [x.id, JSON.stringify(x)]));
    for (const item of after[kind] as (Asset | Ticket | Notification)[]) {
      const data = JSON.stringify(item);
      const prev = old.get(item.id);
      if (prev === data) continue;
      const row = { data, ...columns(kind, item, after) };
      writes.push(
        prev === undefined
          ? appwrite!.tables.createRow({ databaseId: DATABASE_ID, tableId: tableOf[kind], rowId: item.id, data: row })
          : appwrite!.tables.updateRow({ databaseId: DATABASE_ID, tableId: tableOf[kind], rowId: item.id, data: row }),
      );
    }
    await Promise.all(writes);
  }
}

/** Who is acting, from the session (never from the request). */
export const actorFor = (s: SessionUser): Actor => ({ name: s.name, role: s.role === 'client' ? 'client' : 'engineer', facility: s.role === 'client' ? s.facility ?? s.name : undefined });

const facilityOf = (s: SessionUser) => s.facility ?? s.name;

/** What an account may see: engineers see every facility; a hospital only its own equipment and requests. */
export function visibleTo(s: SessionUser, state: ServiceState): ServiceState {
  if (s.role === 'admin') return state; // the admin console sees everything (read-only)
  if (s.role === 'engineer') return { ...state, notifications: state.notifications.filter((n) => n.audience === 'engineer'), purchases: [] };
  const assets = state.assets.filter((a) => a.facility === facilityOf(s));
  const ids = new Set(assets.map((a) => a.id));
  const tickets = state.tickets.filter((t) => ids.has(t.assetId));
  const tids = new Set(tickets.map((t) => t.id));
  const notifications = state.notifications.filter((n) => n.audience === 'client' && ((n.ticketId && tids.has(n.ticketId)) || (n.assetId && ids.has(n.assetId))));
  return { ...state, assets, tickets, notifications, purchases: [] };
}

/** Which actions each role may send, and the checks that keep them to their own facility. */
function allowed(s: SessionUser, a: Action, state: ServiceState): string | null {
  const mine = visibleTo(s, state);
  const ownTicket = (id: string) => mine.tickets.some((t) => t.id === id);
  const ownAsset = (id: string) => mine.assets.some((x) => x.id === id);
  const ownNote = (id: string) => mine.notifications.some((n) => n.id === id);
  if (s.role === 'client') {
    switch (a.type) {
      case 'request': return ownAsset(a.ticket.assetId) ? null : 'That equipment isn’t registered to your facility.';
      case 'note': case 'rate': return ownTicket(a.id) ? null : 'That request isn’t one of yours.';
      case 'read': return ownNote(a.id) ? null : 'Unknown notification.';
      case 'readAll': return a.audience === 'client' ? null : 'Not allowed.';
      default: return 'Not allowed.';
    }
  }
  switch (a.type) {
    case 'assign': return a.engineer === s.name && ownTicket(a.id) ? null : 'You can only assign requests to yourself.';
    case 'travel': case 'arrive': case 'note': case 'part': case 'resolve': return ownTicket(a.id) ? null : 'Unknown request.';
    case 'create':
      if (a.newAsset) return a.newAsset.id === a.ticket.assetId && !state.assets.some((x) => x.id === a.newAsset!.id) ? null : 'Invalid equipment.';
      return ownAsset(a.ticket.assetId) ? null : 'Unknown equipment.';
    case 'calibrate': return ownAsset(a.assetId) ? null : 'Unknown equipment.';
    case 'addAsset': return state.assets.some((x) => x.id === a.asset.id) ? 'That equipment is already registered.' : null;
    case 'read': return ownNote(a.id) ? null : 'Unknown notification.';
    case 'readAll': return a.audience === 'engineer' ? null : 'Not allowed.';
    default: return 'Not allowed.';
  }
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const date = (v: unknown, fallback: string) => {
  const d = typeof v === 'string' ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : fallback;
};

/**
 * Equipment a hospital already owns, registered by an engineer: rebuilt here from the fields that matter, so the
 * browser can't set anything else. Catalogue items take their name, brand and photo from the catalogue.
 */
function cleanAsset(raw: Asset): Asset {
  const p = raw.productSlug ? catalogue.find((c) => c.slug === raw.productSlug) : undefined;
  const name = text(raw.name, 120) || p?.name || '';
  const facility = text(raw.facility, 160);
  if (name.length < 2) throw new DeskError('Enter the equipment name.');
  if (facility.length < 2) throw new DeskError('Choose the hospital.');
  if (!/^AS-[A-Z0-9]{2,20}$/.test(raw.id ?? '')) throw new DeskError('Invalid equipment.');
  const now = new Date().toISOString();
  const interval = Math.min(36, Math.max(1, Math.round(Number(raw.intervalMonths) || 12)));
  const last = date(raw.lastCalibration, date(raw.installed, now));
  const next = new Date(last);
  next.setMonth(next.getMonth() + interval);
  return {
    id: raw.id,
    name,
    brand: text(raw.brand, 60) || p?.brand || '',
    productSlug: p?.slug,
    image: p?.image,
    serial: text(raw.serial, 60) || 'Not recorded',
    facility,
    location: text(raw.location, 80) || 'Location not set',
    readings: [],
    installed: date(raw.installed, now),
    warrantyUntil: date(raw.warrantyUntil, date(raw.installed, now)),
    lastCalibration: last,
    nextCalibration: next.toISOString(),
    intervalMonths: interval,
    certificates: [],
  };
}

/** Hospitals an engineer can register equipment for: registered hospital accounts and facilities already on the desk. */
export async function knownFacilities(): Promise<string[]> {
  const desk = await loadDesk();
  const names = new Set(desk.assets.map((a) => a.facility));
  const { rows } = await appwrite!.tables.listRows<Models.Row & { organisation: string }>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.select(['organisation']), Query.limit(1000)] });
  for (const r of rows) if (r.organisation && !r.organisation.toLowerCase().startsWith('flokefama')) names.add(r.organisation);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export class DeskError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

/**
 * Applies one action for the signed-in account and saves it. If someone else created an item with the same id
 * at the same moment (two new requests both becoming TK-1043), it reloads and tries again.
 */
export async function applyAction(s: SessionUser, action: Action): Promise<ServiceState> {
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const why = allowed(s, action, before);
    if (why) throw new DeskError(why, 403);
    if (action.type === 'addAsset') action = { ...action, asset: cleanAsset(action.asset) };
    // The hospital gets the engineer's own number, from their account (not from the browser)
    if (action.type === 'assign') action = { ...action, phone: s.phone?.trim() || undefined };
    if (action.type === 'create') action = { ...action, phone: s.phone?.trim() || undefined, newAsset: action.newAsset && cleanAsset(action.newAsset), ticket: { ...action.ticket, contactPhone: action.ticket.contactPhone?.trim().slice(0, 30) || undefined } };
    // A Support page caller's machine goes under the hospital's own name when it is on record or registered
    if (action.type === 'create' && action.newAsset)
      action = { ...action, newAsset: { ...action.newAsset, facility: await canonicalFacility(action.newAsset.facility, [...new Set(before.assets.map((a) => a.facility))]) } };
    // The number the hospital gave for text updates
    if (action.type === 'request') action = { ...action, ticket: { ...action.ticket, contactPhone: action.ticket.contactPhone?.trim().slice(0, 30) || undefined } };
    const after = reducer(actorFor(s))(before, action);
    try {
      await saveChanges(before, after);
      // Alerts on phones and computers for the new notifications, and texts for what engineers must act on
      await Promise.all([pushNew(before, after), smsNew(before, after, actorFor(s)), escalateStale(after)]);
      return visibleTo(s, after);
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

/** An engineer changed their phone number: the hospitals on their open jobs see the new one. */
export async function updateEngineerPhone(name: string, phone: string) {
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const after = { ...before, tickets: before.tickets.map((t) => (t.engineer === name && t.status !== 'resolved' && t.engineerPhone !== phone ? { ...t, engineerPhone: phone } : t)) };
    try {
      await saveChanges(before, after);
      return;
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

/** Turns a placed order into the hospital's equipment (and installation jobs), once per order. */
/**
 * The admin console gives a job to an engineer (after the 30-minute warning, say): the same as the engineer pressing
 * Assign to me, so the engineer is texted that the job is theirs and the hospital gets their name and number.
 */
export async function assignByAdmin(admin: string, ticketId: string, engineer: { name: string; phone?: string }) {
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const t = before.tickets.find((x) => x.id === ticketId);
    if (!t) throw new DeskError('That request no longer exists.', 404);
    if (t.status === 'resolved' || t.status === 'onsite') throw new DeskError('That request is already being worked on.');
    // The admin acts for the desk; the engineer named is texted because they are not the one acting
    const actor: Actor = { name: admin, role: 'engineer' };
    const after = reducer(actor)(before, { type: 'assign', id: ticketId, engineer: engineer.name, phone: engineer.phone?.trim() || undefined });
    try {
      await saveChanges(before, after);
      await Promise.all([pushNew(before, after), smsNew(before, after, actor)]);
      return;
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

/**
 * A fault reported on the Support page as not working at all becomes a critical service request straight away, so it
 * never waits for someone to press Book a visit. It is filed under the hospital's own name (when it is on record or
 * registered), on the machine the caller named (added if new), and left unassigned for any engineer to take; the
 * caller's number gets the job's texts. Engineers still call back first. Returns the new request's id.
 */
export async function autoBookVisit(reference: string, r: SupportInput): Promise<string | undefined> {
  if (!appwrite || r.type !== 'fault' || r.working !== 'down') return;
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const facility = await canonicalFacility(r.facility.trim().slice(0, 160), [...new Set(before.assets.map((a) => a.facility))]);
    const named = (r.equipment ?? '').trim().slice(0, 120) || 'Equipment (not named)';
    const existing = before.assets.find((a) => facilityKey(a.facility) === facilityKey(facility) && facilityKey(a.name) === facilityKey(named));
    const newAsset = existing ? undefined : callerAsset(named, facility);
    const description = `${supportDetails(r).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nFrom the website (${reference}): ${r.name}, ${r.phone}.`.slice(0, 1500);
    const actor: Actor = { name: r.name.trim().slice(0, 80) || 'Support page', role: 'client', facility };
    const after = reducer(actor)(before, {
      type: 'create',
      ticket: { assetId: existing?.id ?? newAsset!.id, description, priority: 'critical', contactPhone: r.phone.trim().slice(0, 30) },
      assignToMe: false,
      newAsset,
    });
    const job = after.tickets.find((t) => !before.tickets.some((b) => b.id === t.id));
    try {
      await saveChanges(before, after);
      // A phone alert for the engineers; their text goes with the Support page's own (with this job's number)
      await pushNew(before, after);
      return job?.id;
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

/** A caller's machine that isn't on record yet, registered with the request (as the engineer portal's Book a visit does). */
function callerAsset(name: string, facility: string): Asset {
  const now = new Date();
  const next = new Date(now);
  next.setMonth(next.getMonth() + 12);
  return {
    id: `AS-${now.getTime().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    name, brand: '', serial: 'Not recorded', facility, location: 'Location not set', readings: [],
    installed: now.toISOString(), warrantyUntil: now.toISOString(), lastCalibration: now.toISOString(), nextCalibration: next.toISOString(), intervalMonths: 12, certificates: [],
  };
}

export async function registerPurchase(s: SessionUser, order: string, items: Extract<Action, { type: 'purchase' }>['items']) {
  if (!items.length) return;
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const after = reducer(actorFor(s))({ ...before, purchases: [] }, { type: 'purchase', order, facility: facilityOf(s), items });
    try {
      await saveChanges(before, after);
      await Promise.all([pushNew(before, after), smsNew(before, after, actorFor(s))]);
      return;
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}
