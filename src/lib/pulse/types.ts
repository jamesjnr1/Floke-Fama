/**
 * Site monitor ("pulse"): what the site monitor (/monitor) shows. A visit is one person's time on the site, from
 * the first page until 30 minutes without activity; a day summary is a day's visits added up, kept after the visits
 * themselves are deleted (30 days). No names, emails or IP addresses of the public are kept: a visitor is a random
 * code, with the country and city Vercel reports. Signed-in users (hospitals, staff) show by name.
 */
export type Device = 'Phone' | 'Tablet' | 'Computer';

/** One page of a visit: its address, title, when it opened (seconds into the visit), seconds spent, deepest scroll (%). */
export type PageHit = { p: string; t?: string; at: number; s: number; d?: number; nf?: boolean };
/** Something the visitor did: its name, when (seconds into the visit), the page, and a detail (a product, a search). */
export type VisitEvent = { n: string; at: number; p: string; v?: string };
export type Who = { role: 'client' | 'engineer' | 'admin' | 'sales'; name: string; facility?: string };

export interface Visit {
  id: string;
  /** The visitor's random code, kept in their browser: the same person on a later day has the same code. */
  vid: string;
  /** The day it started (YYYY-MM-DD, Ghana time = UTC). */
  day: string;
  startedAt: string;
  lastAt: string;
  /** First time this browser has been on the site. */
  isNew: boolean;
  country?: string;
  region?: string;
  city?: string;
  device: Device;
  browser: string;
  os: string;
  /** Where they came from: the other website's name, or '' for a typed address or a bookmark. */
  ref: string;
  campaign?: string;
  lang?: string;
  screen?: string;
  who?: Who;
  pages: PageHit[];
  events: VisitEvent[];
  /** Seconds with the site open and in front of them. */
  secs: number;
  vitals?: Partial<Record<Vital, number>>;
  /** They closed the page or moved to another tab. */
  left?: boolean;
}

export const VITALS = ['LCP', 'INP', 'CLS', 'TTFB', 'FCP'] as const;
export type Vital = (typeof VITALS)[number];
/** Google's limits for each speed measure: up to `good` is good, above `poor` is poor (ms; CLS has no unit). */
export const vitalLimits: Record<Vital, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

/** The actions that count as an enquiry: someone asked Flokefama for something. */
export const ENQUIRIES = ['quote_submitted', 'quote_list_request', 'demo_submitted', 'chat_request_sent', 'datasheet_request', 'checkout_pay'];

type Counts = Record<string, number>;
export interface DaySummary {
  day: string;
  /** 'ga': this day is from Google Analytics (before the monitor was switched on), not the monitor's own records. */
  from?: 'ga';
  visits: number;
  visitors: number;
  newVisitors: number;
  views: number;
  secs: number;
  /** Visits that saw one page and did nothing. */
  bounces: number;
  enquiries: number;
  /** Visits by signed-in staff (admins, sales, engineers): counted here only, not in the figures above. */
  staff: number;
  /** Visits started and pages opened in each hour of the day (0 to 23, Ghana time). */
  hours: number[];
  viewHours: number[];
  pages: Record<string, { v: number; s: number; t?: string }>;
  entries: Counts;
  exits: Counts;
  sources: Counts;
  countries: Counts;
  cities: Counts;
  devices: Counts;
  browsers: Counts;
  systems: Counts;
  events: Counts;
  searches: Counts;
  products: Record<string, { v: number; t?: string }>;
  notFound: Counts;
  vitals: Partial<Record<Vital, { n: number; sum: number; good: number; poor: number }>>;
}

export const emptyDay = (day: string): DaySummary => ({
  day, visits: 0, visitors: 0, newVisitors: 0, views: 0, secs: 0, bounces: 0, enquiries: 0, staff: 0,
  hours: Array(24).fill(0), viewHours: Array(24).fill(0),
  pages: {}, entries: {}, exits: {}, sources: {}, countries: {}, cities: {}, devices: {}, browsers: {}, systems: {}, events: {}, searches: {}, products: {}, notFound: {}, vitals: {},
});

export const isStaff = (v: Visit) => Boolean(v.who && v.who.role !== 'client');
const bump = (m: Counts, k: string | undefined, by = 1) => {
  if (k) m[k] = (m[k] ?? 0) + by;
};

/** Where a visit came from, in plain words. */
export function sourceOf(v: Pick<Visit, 'ref' | 'campaign'>) {
  if (v.campaign) return `Campaign: ${v.campaign}`;
  const h = v.ref.toLowerCase();
  if (!h) return 'Direct (typed or saved)';
  const known: [RegExp, string][] = [
    [/google\./, 'Google'], [/bing\.com/, 'Bing'], [/duckduckgo/, 'DuckDuckGo'], [/yahoo\./, 'Yahoo'],
    [/facebook\.com|fb\.com|fb\.me/, 'Facebook'], [/instagram\.com/, 'Instagram'], [/linkedin\.com|lnkd\.in/, 'LinkedIn'],
    [/(^|\.)t\.co$|twitter\.com|(^|\.)x\.com$/, 'X (Twitter)'], [/whatsapp|wa\.me/, 'WhatsApp'], [/youtube\.com|youtu\.be/, 'YouTube'], [/tiktok\.com/, 'TikTok'],
    [/chatgpt|openai|perplexity|claude\.ai|copilot/, 'AI assistant'],
  ];
  return known.find(([re]) => re.test(h))?.[1] ?? h.replace(/^www\./, '');
}

/** Adds a day's visits up. Staff visits are counted apart. */
export function summarise(day: string, visits: Visit[]): DaySummary {
  const d = emptyDay(day);
  const people = new Set<string>();
  for (const v of visits) {
    if (isStaff(v)) {
      d.staff++;
      continue;
    }
    d.visits++;
    people.add(v.vid);
    if (v.isNew) d.newVisitors++;
    d.views += v.pages.length;
    d.secs += v.secs;
    if (v.pages.length <= 1 && v.events.length === 0) d.bounces++;
    if (v.events.some((e) => ENQUIRIES.includes(e.n))) d.enquiries++;
    const start = Date.parse(v.startedAt);
    d.hours[new Date(start).getUTCHours()]++;
    v.pages.forEach((p, i) => {
      d.viewHours[new Date(start + p.at * 1000).getUTCHours()]++;
      const row = (d.pages[p.p] ??= { v: 0, s: 0 });
      row.v++;
      row.s += p.s;
      if (p.t) row.t = p.t;
      if (p.nf) bump(d.notFound, p.p);
      if (i === 0) bump(d.entries, p.p);
      if (i === v.pages.length - 1) bump(d.exits, p.p);
      const product = /^\/products\/([^/]+)$/.exec(p.p);
      if (product && !p.nf) {
        const pr = (d.products[product[1]] ??= { v: 0 });
        pr.v++;
        if (p.t) pr.t = p.t;
      }
    });
    bump(d.sources, sourceOf(v));
    bump(d.countries, v.country || '??');
    if (v.city) bump(d.cities, `${v.city}, ${v.country ?? ''}`);
    bump(d.devices, v.device);
    bump(d.browsers, v.browser);
    bump(d.systems, v.os);
    for (const e of v.events) {
      bump(d.events, e.n);
      if (e.n === 'search' && e.v) bump(d.searches, e.v.toLowerCase());
    }
    for (const k of VITALS) {
      const val = v.vitals?.[k];
      if (typeof val !== 'number') continue;
      const row = (d.vitals[k] ??= { n: 0, sum: 0, good: 0, poor: 0 });
      row.n++;
      row.sum += val;
      if (val <= vitalLimits[k].good) row.good++;
      else if (val > vitalLimits[k].poor) row.poor++;
    }
  }
  d.visitors = people.size;
  return trim(d);
}

const top = <T>(m: Record<string, T>, n: number, size: (x: T) => number) => Object.fromEntries(Object.entries(m).sort((a, b) => size(b[1]) - size(a[1])).slice(0, n));
const num = (x: number) => x;
/** Keeps the biggest of each list, so a day's summary stays small. */
function trim(d: DaySummary): DaySummary {
  return {
    ...d,
    pages: top(d.pages, 150, (x) => x.v), products: top(d.products, 100, (x) => x.v),
    entries: top(d.entries, 60, num), exits: top(d.exits, 60, num), sources: top(d.sources, 60, num), countries: top(d.countries, 80, num), cities: top(d.cities, 80, num),
    browsers: top(d.browsers, 20, num), systems: top(d.systems, 20, num), events: top(d.events, 60, num), searches: top(d.searches, 80, num), notFound: top(d.notFound, 40, num),
  };
}

/** Several days as one. Visitors are added day by day (the same person on two days counts twice). */
export function merge(days: DaySummary[]): DaySummary {
  const out = emptyDay(days.length ? `${days[0].day}..${days[days.length - 1].day}` : '');
  for (const d of days) {
    if (d.from === 'ga' && d.visits) out.from = 'ga';
    for (const k of ['visits', 'visitors', 'newVisitors', 'views', 'secs', 'bounces', 'enquiries', 'staff'] as const) out[k] += d[k] ?? 0;
    d.hours?.forEach((n, h) => (out.hours[h] += n));
    d.viewHours?.forEach((n, h) => (out.viewHours[h] += n));
    for (const k of ['entries', 'exits', 'sources', 'countries', 'cities', 'devices', 'browsers', 'systems', 'events', 'searches', 'notFound'] as const) for (const [key, n] of Object.entries(d[k] ?? {})) bump(out[k], key, n);
    for (const [p, row] of Object.entries(d.pages ?? {})) {
      const o = (out.pages[p] ??= { v: 0, s: 0 });
      o.v += row.v;
      o.s += row.s;
      if (row.t) o.t = row.t;
    }
    for (const [p, row] of Object.entries(d.products ?? {})) {
      const o = (out.products[p] ??= { v: 0 });
      o.v += row.v;
      if (row.t) o.t = row.t;
    }
    for (const k of VITALS) {
      const row = d.vitals?.[k];
      if (!row) continue;
      const o = (out.vitals[k] ??= { n: 0, sum: 0, good: 0, poor: 0 });
      o.n += row.n;
      o.sum += row.sum;
      o.good += row.good;
      o.poor += row.poor;
    }
  }
  return out;
}

/** What the browser sends (components/pulse.tsx → /api/pulse). */
export type PulseItem =
  | { k: 'view'; p: string; t?: string; nf?: boolean }
  | { k: 'time'; s: number; d?: number }
  | { k: 'event'; n: string; v?: string }
  | { k: 'vital'; n: string; v: number }
  | { k: 'leave' };
export interface PulseBatch {
  id: string;
  vid: string;
  isNew?: boolean;
  ref?: string;
  campaign?: string;
  lang?: string;
  screen?: string;
  /** The page they are on, in case the visit's first message was lost. */
  p: string;
  items: PulseItem[];
}
