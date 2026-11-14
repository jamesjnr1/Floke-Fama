import 'server-only';
import { createSign } from 'node:crypto';
import { emptyDay, sourceOf, type DaySummary } from '@/lib/pulse/types';

/**
 * The past, from Google Analytics. The site monitor only knows the days since it was switched on; the days before
 * come from the site's Google Analytics property (GA4), read with a Google service account:
 *   GA_PROPERTY_ID   the property's number (Analytics → Admin → Property details), not the G-… tag
 *   GA_CLIENT_EMAIL  the service account's email, added to the property as a Viewer
 *   GA_PRIVATE_KEY   the service account's private key (the "private_key" of its JSON key file)
 * Read-only. Without all three, the past simply stays empty.
 */
const propertyId = () => (process.env.GA_PROPERTY_ID ?? '').replace(/\D/g, '');
const clientEmail = () => process.env.GA_CLIENT_EMAIL?.trim() ?? '';
const privateKey = () => (process.env.GA_PRIVATE_KEY ?? '').replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();
const tokenUrl = () => process.env.GA_TOKEN_URL?.trim() || 'https://oauth2.googleapis.com/token';
const dataUrl = () => (process.env.GA_DATA_URL?.trim() || 'https://analyticsdata.googleapis.com/v1beta').replace(/\/$/, '');

export const gaConfigured = () => Boolean(propertyId() && clientEmail() && privateKey().includes('PRIVATE KEY'));

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url');
let cached: { token: string; until: number } | null = null;

/** A short-lived Google access token for the service account (signed here, no Google library needed). */
async function accessToken() {
  if (cached && cached.until > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify({ iss: clientEmail(), scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }))}`;
  const assertion = `${unsigned}.${b64(createSign('RSA-SHA256').update(unsigned).sign(privateKey()))}`;
  const res = await fetch(tokenUrl(), { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }), signal: AbortSignal.timeout(10_000), cache: 'no-store' });
  if (!res.ok) throw new Error(`Google sign-in answered ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cached = { token: json.access_token, until: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cached.token;
}

type Report = { rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] };
const dims = (...names: string[]) => names.map((name) => ({ name }));
const mets = (...names: string[]) => names.map((name) => ({ name }));
/** GA's 20261114 as 2026-11-14. */
const dayOf = (v: string) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
const unset = (v: string) => !v || v === '(not set)';
const deviceNames: Record<string, string> = { mobile: 'Phone', tablet: 'Tablet', desktop: 'Computer', 'smart tv': 'Computer' };

/**
 * Each day from `from` to `to` (YYYY-MM-DD) as Google Analytics saw it, in the monitor's own shape. Actions,
 * searches and page speed are not in it: Google does not record them the way the monitor does.
 */
export async function gaDays(from: string, to: string): Promise<Map<string, DaySummary>> {
  const out = new Map<string, DaySummary>();
  if (!gaConfigured() || from > to) return out;
  const range = { dateRanges: [{ startDate: from, endDate: to }], limit: 100000 };
  const res = await fetch(`${dataUrl()}/properties/${propertyId()}:batchRunReports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { ...range, dimensions: dims('date'), metrics: mets('sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'userEngagementDuration', 'engagedSessions') },
        { ...range, dimensions: dims('date', 'pagePath', 'pageTitle'), metrics: mets('screenPageViews', 'userEngagementDuration') },
        { ...range, dimensions: dims('date', 'sessionSource'), metrics: mets('sessions') },
        { ...range, dimensions: dims('date', 'countryId', 'city'), metrics: mets('sessions') },
        { ...range, dimensions: dims('date', 'deviceCategory', 'browser', 'operatingSystem'), metrics: mets('sessions') },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google Analytics answered ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  const [totals, pages, sources, places, devices] = ((await res.json()) as { reports?: Report[] }).reports ?? [];
  const day = (v: string) => {
    const d = dayOf(v);
    if (!out.has(d)) out.set(d, { ...emptyDay(d), from: 'ga' });
    return out.get(d)!;
  };
  const add = (m: Record<string, number>, k: string, by: number) => {
    if (k && by) m[k] = (m[k] ?? 0) + by;
  };
  for (const r of totals?.rows ?? []) {
    const d = day(r.dimensionValues[0].value);
    const [sessions, users, fresh, views, secs, engaged] = r.metricValues.map((m) => Number(m.value) || 0);
    Object.assign(d, { visits: sessions, visitors: users, newVisitors: fresh, views, secs: Math.round(secs), bounces: Math.max(0, sessions - engaged) });
  }
  for (const r of pages?.rows ?? []) {
    const d = day(r.dimensionValues[0].value);
    const path = (r.dimensionValues[1].value.split(/[?#]/)[0].replace(/\/+$/, '') || '/').slice(0, 200);
    const title = r.dimensionValues[2].value.replace(/\s*\|\s*Flokefama\s*$/, '').slice(0, 120);
    const views = Number(r.metricValues[0].value) || 0;
    const row = (d.pages[path] ??= { v: 0, s: 0 });
    row.v += views;
    row.s += Math.round(Number(r.metricValues[1].value) || 0);
    if (!unset(title)) row.t = title;
    const product = /^\/products\/([^/]+)$/.exec(path);
    if (product) {
      const p = (d.products[product[1]] ??= { v: 0 });
      p.v += views;
      if (!unset(title)) p.t = title;
    }
  }
  for (const r of sources?.rows ?? []) {
    const src = r.dimensionValues[1].value;
    // Google gives bare names ("google", "bing"): matched to the monitor's names as if they were addresses
    const named = src.includes('.') ? sourceOf({ ref: src }) : sourceOf({ ref: `${src}.com` });
    add(day(r.dimensionValues[0].value).sources, src === '(direct)' || unset(src) ? sourceOf({ ref: '' }) : named === `${src}.com` ? src : named, Number(r.metricValues[0].value) || 0);
  }
  for (const r of places?.rows ?? []) {
    const d = day(r.dimensionValues[0].value);
    const code = unset(r.dimensionValues[1].value) ? '??' : r.dimensionValues[1].value.toUpperCase();
    const sessions = Number(r.metricValues[0].value) || 0;
    add(d.countries, code, sessions);
    if (!unset(r.dimensionValues[2].value)) add(d.cities, `${r.dimensionValues[2].value}, ${code}`, sessions);
  }
  for (const r of devices?.rows ?? []) {
    const d = day(r.dimensionValues[0].value);
    const sessions = Number(r.metricValues[0].value) || 0;
    add(d.devices, deviceNames[r.dimensionValues[1].value.toLowerCase()] ?? 'Computer', sessions);
    if (!unset(r.dimensionValues[2].value)) add(d.browsers, r.dimensionValues[2].value, sessions);
    if (!unset(r.dimensionValues[3].value)) add(d.systems, r.dimensionValues[3].value === 'Macintosh' ? 'macOS' : r.dimensionValues[3].value, sessions);
  }
  return out;
}
