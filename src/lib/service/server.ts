import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import type { SessionUser } from '@/lib/auth/session';
import { pushNew } from '@/lib/push';
import { createSeed, reducer, type Action, type Actor, type Asset, type Notification, type ServiceState, type Ticket } from '@/lib/service/desk';

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
export const actorFor = (s: SessionUser): Actor => ({ name: s.name, role: s.role, facility: s.role === 'client' ? s.facility ?? s.name : undefined });

const facilityOf = (s: SessionUser) => s.facility ?? s.name;

/** What an account may see: engineers see every facility; a hospital only its own equipment and requests. */
export function visibleTo(s: SessionUser, state: ServiceState): ServiceState {
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
    case 'create': return ownAsset(a.ticket.assetId) ? null : 'Unknown equipment.';
    case 'calibrate': return ownAsset(a.assetId) ? null : 'Unknown equipment.';
    case 'read': return ownNote(a.id) ? null : 'Unknown notification.';
    case 'readAll': return a.audience === 'engineer' ? null : 'Not allowed.';
    default: return 'Not allowed.';
  }
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
    const after = reducer(actorFor(s))(before, action);
    try {
      await saveChanges(before, after);
      await pushNew(before, after); // alerts on phones and computers, for the new notifications
      return visibleTo(s, after);
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}

/** Turns a placed order into the hospital's equipment (and installation jobs), once per order. */
export async function registerPurchase(s: SessionUser, order: string, items: Extract<Action, { type: 'purchase' }>['items']) {
  if (!items.length) return;
  for (let attempt = 0; ; attempt++) {
    const before = await loadDesk();
    const after = reducer(actorFor(s))({ ...before, purchases: [] }, { type: 'purchase', order, facility: facilityOf(s), items });
    try {
      await saveChanges(before, after);
      await pushNew(before, after);
      return;
    } catch (e) {
      if ((e as { code?: number }).code === 409 && attempt < 2) continue;
      throw e;
    }
  }
}
