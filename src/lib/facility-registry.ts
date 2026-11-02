import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { isTableMissing, withTable } from '@/lib/appwrite-tables';
import { facilityKey } from '@/lib/service/desk';

/**
 * The hospital registry. Every hospital or facility gets a permanent code (FLK-H001, FLK-H002, …) the first time it
 * appears: when it registers, when the admin console registers it, or when equipment or a request is filed under it.
 * The code is the row's id, so the database itself makes each one unique; rows are never deleted (a hospital is made
 * inactive instead), so a code is never reused. The name links the registry to the hospital's equipment, requests and
 * accounts (matched ignoring capitals, spaces and punctuation), so the same hospital can't be registered twice.
 */
export type FacilityStatus = 'active' | 'inactive';
export interface Facility {
  code: string;
  name: string;
  status: FacilityStatus;
  region?: string;
  address?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  createdBy?: string;
}
type Details = Partial<Pick<Facility, 'region' | 'address' | 'contactName' | 'phone' | 'email'>>;
type Row = Models.Row & { key: string; name: string; status: string; data: string };

const PREFIX = 'FLK-H';
export const facilityCode = (n: number) => `${PREFIX}${String(n).padStart(3, '0')}`;
const numberOf = (code: string) => Number(code.slice(PREFIX.length)) || 0;

const fromRow = (r: Row): Facility => {
  let extra: Details & { createdBy?: string } = {};
  try {
    extra = JSON.parse(r.data);
  } catch {
    /* only the columns */
  }
  return { ...extra, code: r.$id, name: r.name, status: r.status === 'inactive' ? 'inactive' : 'active', createdAt: r.$createdAt };
};

let cache: { key: string; list: Facility[] } | null = null;

/** Every hospital in the registry, by code. One small read when nothing has changed since the last time. */
export async function listFacilities(): Promise<Facility[]> {
  if (!appwrite) return [];
  try {
    const probe = await appwrite.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.facilities, queries: [Query.orderDesc('$updatedAt'), Query.limit(1)] });
    const key = `${probe.total}:${probe.rows[0]?.$id ?? ''}:${probe.rows[0]?.$updatedAt ?? ''}`;
    if (cache?.key === key) return cache.list;
    const rows: Row[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 40; i++) {
      const page = await appwrite.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.facilities, queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
      rows.push(...page.rows);
      if (page.rows.length < 500) break;
      cursor = page.rows[page.rows.length - 1].$id;
    }
    const list = rows.map(fromRow).sort((a, b) => numberOf(a.code) - numberOf(b.code));
    cache = { key, list };
    return list;
  } catch (e) {
    if (isTableMissing(e)) return []; // made on the first registration
    throw e;
  }
}

/** The registry entry for a hospital name (or undefined). */
export const findFacility = (list: Facility[], name: string | undefined) => {
  const k = facilityKey(name ?? '');
  return k ? list.find((f) => facilityKey(f.name) === k) : undefined;
};

/** Hospital name → code, for showing codes next to names. */
export async function facilityCodes(): Promise<Record<string, string>> {
  return Object.fromEntries((await listFacilities()).map((f) => [f.name, f.code]));
}

/**
 * The hospital's registry entry, made (with the next free code) if it isn't there yet. Details given fill in what
 * the entry doesn't have.
 */
export function ensureFacility(name: string, details: Details = {}, by?: string): Promise<Facility | null> {
  // One at a time on this server, so two registrations of the same hospital at once can't get two codes
  const run = queue.then(() => ensure(name, details, by));
  queue = run.catch(() => undefined);
  return run;
}
let queue: Promise<unknown> = Promise.resolve();

async function ensure(name: string, details: Details, by?: string): Promise<Facility | null> {
  const clean = name.trim().slice(0, 160);
  if (!appwrite || facilityKey(clean).length < 2) return null;
  const list = await listFacilities();
  const found = findFacility(list, clean);
  if (found) return found;
  let n = Math.max(0, ...list.map((f) => numberOf(f.code))) + 1;
  for (let attempt = 0; attempt < 25; attempt++, n++) {
    const code = facilityCode(n);
    try {
      const data = JSON.stringify({ ...clip(details), createdBy: by });
      const row = await withTable(TABLES.facilities, () =>
        appwrite!.tables.createRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.facilities, rowId: code, data: { key: facilityKey(clean).slice(0, 160), name: clean, status: 'active', data } }),
      );
      cache = null;
      return fromRow(row);
    } catch (e) {
      if ((e as { code?: number }).code !== 409) throw e; // that code was just taken: the next one
    }
  }
  throw new Error('No free hospital code');
}

const clip = (d: Details): Details =>
  Object.fromEntries(Object.entries(d).flatMap(([k, v]) => (typeof v === 'string' && v.trim() ? [[k, v.trim().slice(0, k === 'address' ? 300 : 160)]] : []))) as Details;

/** Changes a hospital's details or status (not its name or code). */
export async function updateFacility(code: string, patch: Details & { status?: FacilityStatus }) {
  if (!appwrite) return;
  const row = await appwrite.tables.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.facilities, rowId: code });
  const current = fromRow(row);
  const { status, ...details } = patch;
  const merged = { region: current.region, address: current.address, contactName: current.contactName, phone: current.phone, email: current.email, createdBy: current.createdBy, ...clip(details) };
  await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.facilities, rowId: code, data: { status: status ?? current.status, data: JSON.stringify(merged) } });
  cache = null;
}

/**
 * Gives a code to every hospital already in the system that hasn't one yet (oldest first), so the registry is
 * complete without anyone typing them in. Run by the admin console.
 */
export async function syncRegistry(seen: { name: string; at: string; details?: Details }[]) {
  if (!appwrite) return;
  const list = await listFacilities();
  const missing = new Map<string, { name: string; at: string; details?: Details }>();
  for (const s of [...seen].sort((a, b) => a.at.localeCompare(b.at))) {
    const k = facilityKey(s.name);
    if (k.length < 2 || findFacility(list, s.name)) continue;
    // The first time it was seen sets its place in the order; details come from wherever they are (its account)
    const first = missing.get(k);
    if (!first) missing.set(k, s);
    else if (!first.details && s.details) missing.set(k, { ...first, details: s.details });
  }
  for (const s of missing.values()) await ensureFacility(s.name, s.details, 'Existing records').catch((e) => console.error('registry: not added', s.name, e));
}

/** Whether a hospital may use its portal (not made inactive). Fails open: if the registry can't be read, it may. */
export async function facilityActive(name: string | undefined) {
  try {
    return findFacility(await listFacilities(), name)?.status !== 'inactive';
  } catch {
    return true;
  }
}
