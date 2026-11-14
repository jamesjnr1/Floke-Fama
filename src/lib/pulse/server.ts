import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { isTableMissing, withTable } from '@/lib/appwrite-tables';
import { emptyDay, merge, summarise, VITALS, type DaySummary, type Device, type PulseBatch, type PulseItem, type Visit, type Vital, type Who } from '@/lib/pulse/types';

/**
 * The site monitor's records (see lib/pulse/types.ts): saving what browsers report, and reading it back for the
 * manager's dashboard. Everything here is quiet about failure: recording a visit must never break or slow a page.
 */
const MAX_PAGES = 80;
const MAX_EVENTS = 100;
/** Raw visits are kept this many days; the day summaries stay. */
export const KEEP_DAYS = 30;
/** A visitor counts as on the site now if their browser reported within this long. */
export const LIVE_MS = 75_000;

type VisitRow = Models.Row & { day: string; lastAt: string; data: string };
type DayRow = Models.Row & { day: string; data: string };

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '');
/** A page address without its ?query (which can hold personal details) and without a trailing slash. */
const pathOf = (s: unknown) => {
  const p = clean(s, 200).split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return p.startsWith('/') ? p : '/';
};

/** Search engines, link previews and testing tools: not people, so not recorded. */
export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|curl|wget|python|node-fetch|axios|go-http|java\/|scrapy|phantom|puppeteer|playwright/i.test(ua);

export function deviceOf(ua: string): { device: Device; browser: string; os: string } {
  const device: Device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|ipod|android/i.test(ua) ? 'Phone' : 'Computer';
  const browser = /edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera' : /samsungbrowser/i.test(ua) ? 'Samsung Internet' : /firefox|fxios/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Other';
  const os = /windows/i.test(ua) ? 'Windows' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /mac os/i.test(ua) ? 'macOS' : /cros/i.test(ua) ? 'ChromeOS' : /linux/i.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

/** Checks what the browser sent; null when it isn't a report from the site's own script. */
export function parseBatch(raw: unknown): PulseBatch | null {
  const b = raw as Partial<PulseBatch> | null;
  if (!b || typeof b !== 'object' || !/^[a-z0-9]{16,40}$/.test(String(b.id)) || !/^[a-z0-9]{16,40}$/.test(String(b.vid)) || !Array.isArray(b.items)) return null;
  const items: PulseItem[] = [];
  for (const it of b.items.slice(0, 60) as Partial<PulseItem & { n: string; v: unknown; s: number; d: number; p: string; t: string; nf: boolean }>[]) {
    if (!it || typeof it !== 'object') continue;
    if (it.k === 'view') items.push({ k: 'view', p: pathOf(it.p), t: clean(it.t, 120) || undefined, nf: it.nf === true || undefined });
    else if (it.k === 'time' && Number.isFinite(it.s)) items.push({ k: 'time', s: Math.max(0, Math.min(90, Math.round(Number(it.s)))), d: Number.isFinite(it.d) ? Math.max(0, Math.min(100, Math.round(Number(it.d)))) : undefined });
    else if (it.k === 'event' && /^[a-z0-9_]{2,40}$/.test(String(it.n))) items.push({ k: 'event', n: String(it.n), v: clean(it.v, 140) || undefined });
    else if (it.k === 'vital' && (VITALS as readonly string[]).includes(String(it.n)) && Number.isFinite(it.v) && Number(it.v) >= 0 && Number(it.v) < 120_000) items.push({ k: 'vital', n: String(it.n), v: Number(it.v) });
    else if (it.k === 'leave') items.push({ k: 'leave' });
  }
  const ref = clean(b.ref, 80).toLowerCase();
  return {
    id: String(b.id), vid: String(b.vid), isNew: b.isNew === true, items, p: pathOf(b.p),
    ref: /^[a-z0-9.-]+$/.test(ref) ? ref : '', campaign: clean(b.campaign, 60) || undefined, lang: clean(b.lang, 12) || undefined, screen: /^\d{2,5}x\d{2,5}$/.test(String(b.screen)) ? String(b.screen) : undefined,
  };
}

export interface Seen {
  ua: string;
  country?: string;
  region?: string;
  city?: string;
  who?: Who;
}

/** Adds a browser's report to its visit (starting the visit if this is its first). Pure: no database. */
export function apply(before: Visit | null, b: PulseBatch, seen: Seen, now = Date.now()): Visit {
  const at = new Date(now).toISOString();
  const v: Visit = before
    ? { ...before, pages: [...before.pages], events: [...before.events] }
    : { id: b.id, vid: b.vid, day: today(now), startedAt: at, lastAt: at, isNew: Boolean(b.isNew), ...deviceOf(seen.ua), ref: b.ref ?? '', campaign: b.campaign, lang: b.lang, screen: b.screen, pages: [], events: [], secs: 0 };
  if (!before) Object.assign(v, { country: seen.country, region: seen.region, city: seen.city });
  if (seen.who) v.who = seen.who;
  const offset = Math.max(0, Math.round((now - Date.parse(v.startedAt)) / 1000));
  let left = false;
  for (const it of b.items) {
    if (it.k === 'leave') {
      left = true;
      continue;
    }
    left = false;
    if (it.k === 'view') {
      const last = v.pages[v.pages.length - 1];
      // The same page reported twice in a row (a refresh, or a title that arrived late) stays one page
      if (last && last.p === it.p) {
        if (it.t) last.t = it.t;
        if (it.nf) last.nf = true;
      } else if (v.pages.length < MAX_PAGES) v.pages.push({ p: it.p, t: it.t, at: offset, s: 0, ...(it.nf ? { nf: true } : {}) });
    } else if (it.k === 'time') {
      if (!v.pages.length) v.pages.push({ p: b.p, at: offset, s: 0 });
      const page = v.pages[v.pages.length - 1];
      page.s += it.s;
      v.secs += it.s;
      if (it.d !== undefined) page.d = Math.max(page.d ?? 0, it.d);
    } else if (it.k === 'event') {
      if (v.events.length < MAX_EVENTS) v.events.push({ n: it.n, at: offset, p: v.pages[v.pages.length - 1]?.p ?? b.p, ...(it.v ? { v: it.v } : {}) });
    } else if (it.k === 'vital') {
      // The first reading of each measure is the landing page's: the one that says how fast the site felt
      const k = it.n as Vital;
      v.vitals = { ...v.vitals, [k]: k === 'CLS' || k === 'INP' ? Math.max(v.vitals?.[k] ?? 0, it.v) : (v.vitals?.[k] ?? it.v) };
    }
  }
  if (!v.pages.length) v.pages.push({ p: b.p, at: offset, s: 0 });
  v.lastAt = at;
  if (left) v.left = true;
  else delete v.left;
  return v;
}

const parseVisit = (r: VisitRow): Visit[] => {
  try {
    return [JSON.parse(r.data) as Visit];
  } catch {
    return [];
  }
};

/** Saves one report from a browser. Never throws. */
export async function ingest(b: PulseBatch, seen: Seen) {
  if (!appwrite) return;
  try {
    const db = appwrite.tables;
    const args = { databaseId: DATABASE_ID, tableId: TABLES.visits, rowId: b.id };
    const found = await withTable(TABLES.visits, () => db.getRow<VisitRow>(args)).catch((e) => (isNotFound(e) ? null : Promise.reject(e)));
    const next = apply(found ? (parseVisit(found)[0] ?? null) : null, b, seen);
    const data = { day: next.day, lastAt: next.lastAt, data: JSON.stringify(next) };
    if (found) await db.updateRow({ ...args, data });
    else await db.createRow({ ...args, data }).catch((e) => ((e as { code?: number }).code === 409 ? db.updateRow({ ...args, data }) : Promise.reject(e)));
  } catch (e) {
    console.error('[pulse] visit not recorded:', (e as Error)?.message ?? e);
  }
}

async function list<R extends Models.Row>(tableId: string, queries: string[], max: number): Promise<R[]> {
  if (!appwrite) return [];
  const out: R[] = [];
  let after: string | undefined;
  try {
    while (out.length < max) {
      const page = await appwrite.tables.listRows<R>({ databaseId: DATABASE_ID, tableId, queries: [...queries, Query.limit(Math.min(200, max - out.length)), ...(after ? [Query.cursorAfter(after)] : [])] });
      out.push(...page.rows);
      if (page.rows.length < 200) break;
      after = page.rows[page.rows.length - 1].$id;
    }
  } catch (e) {
    if (!isTableMissing(e)) throw e;
  }
  return out;
}

/** The latest visits, newest activity first: the ones on the site now, then those who just left. */
export async function latestVisits(limit = 80): Promise<Visit[]> {
  return (await list<VisitRow>(TABLES.visits, [Query.orderDesc('lastAt')], limit)).flatMap(parseVisit);
}

export const isLive = (v: Visit, now = Date.now()) => !v.left && now - Date.parse(v.lastAt) < LIVE_MS;

const visitsOn = async (day: string) => (await list<VisitRow>(TABLES.visits, [Query.equal('day', day)], 5000)).flatMap(parseVisit);

const daysBack = (n: number, now = Date.now()) => Array.from({ length: n }, (_, i) => today(now - (n - 1 - i) * 864e5));

/**
 * The summaries of the last `n` days, oldest first, today's worked out fresh. A past day is added up once from its
 * visits and saved; before the monitor existed (or past the 30 days of kept visits) a day is simply empty.
 */
export async function daySummaries(n: number, now = Date.now()): Promise<DaySummary[]> {
  const days = daysBack(n, now);
  const t = today(now);
  const saved = new Map<string, DaySummary>();
  for (const r of await list<DayRow>(TABLES.visitDays, [Query.greaterThanEqual('day', days[0])], 400)) {
    try {
      saved.set(r.day, JSON.parse(r.data) as DaySummary);
    } catch {
      /* a broken row is worked out again */
    }
  }
  const oldest = today(now - (KEEP_DAYS - 1) * 864e5);
  let budget = 8; // at most this many days added up per request, so the dashboard never waits long
  const out: DaySummary[] = [];
  for (const day of days) {
    if (day === t) out.push(summarise(day, await visitsOn(day)));
    else if (saved.has(day)) out.push(saved.get(day)!);
    else if (day >= oldest && budget-- > 0 && appwrite) {
      const sum = summarise(day, await visitsOn(day));
      out.push(sum);
      await withTable(TABLES.visitDays, () => appwrite!.tables.upsertRow({ databaseId: DATABASE_ID, tableId: TABLES.visitDays, rowId: `d${day}`, data: { day, data: JSON.stringify(sum) } })).catch((e) => console.error('[pulse] day summary not saved:', (e as Error)?.message ?? e));
    } else out.push(emptyDay(day));
  }
  return out;
}

/** Deletes visits older than 30 days (their days are summarised first). Run by the daily job. */
export async function pruneVisits(now = Date.now()) {
  if (!appwrite) return 0;
  await daySummaries(KEEP_DAYS + 3, now).catch(() => {});
  const old = await list<VisitRow>(TABLES.visits, [Query.lessThan('day', today(now - KEEP_DAYS * 864e5)), Query.select(['$id'])], 400);
  for (const r of old) await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.visits, rowId: r.$id }).catch(() => {});
  return old.length;
}

export { merge };
