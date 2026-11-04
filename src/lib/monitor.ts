import 'server-only';
import { createHash } from 'node:crypto';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { isTableMissing, withTable } from '@/lib/appwrite-tables';
import { emailSupport, supportEmailConfigured } from '@/lib/support-email';
import { siteUrl } from '@/lib/utils';

/**
 * Site health: every error on the website and the portals is recorded here, so the admin console (Site health) shows
 * what went wrong, where, how often and when last. One row per kind of error (same place, same message), with a
 * count, so a page failing a hundred times is one line, not a hundred.
 *
 * The first time a kind of error appears (and again if it is still happening 6 hours after the last email), the
 * admins get an email: MONITOR_EMAIL_TO (comma-separated) if set, else the ADMIN_EMAILS. Recording never throws and
 * never holds a page up for long.
 */
export type SiteArea = 'Website' | 'Hospital portal' | 'Engineer portal' | 'Admin console' | 'Background job';

export interface SiteError {
  id: string;
  area: SiteArea;
  /** Where it happened: the page or address (no ?query, which can hold personal details). */
  path: string;
  message: string;
  /** 'server' (the site's own code) or 'browser' (on a visitor's screen) */
  source: 'server' | 'browser';
  firstAt: string;
  lastAt: string;
  count: number;
  /** Next.js's error code, to find the full details in Vercel's logs */
  digest?: string;
  /** The last time an email went out about it */
  alertedAt?: string;
}

const ALERT_EVERY_MS = 6 * 60 * 60_000;

/** Which part of the site an address belongs to. */
export function areaOf(path: string): SiteArea {
  const p = path.split('?')[0];
  if (p.startsWith('/portal') || p.startsWith('/api/orders') || p.startsWith('/api/support') || p.startsWith('/login')) return 'Hospital portal';
  if (p.startsWith('/engineer') || p.startsWith('/api/service') || p.startsWith('/api/team')) return 'Engineer portal';
  if (p.startsWith('/admin') || p.startsWith('/api/admin') || p.startsWith('/api/texts')) return 'Admin console';
  if (p.startsWith('/api/cron')) return 'Background job';
  return 'Website';
}

/** Numbers, ids and long codes taken out, so the same error on different records counts as one kind. */
const shape = (message: string) => message.replace(/[0-9a-f]{8,}/gi, '#').replace(/\d+/g, '#').slice(0, 300);
const idOf = (area: string, path: string, message: string) => createHash('sha1').update(`${area}|${shape(path)}|${shape(message)}`).digest('hex').slice(0, 32);

const recipients = () =>
  (process.env.MONITOR_EMAIL_TO?.trim() || process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

type Row = Models.Row & { area: string; lastAt: string; data: string };

/** Records one error. Never throws. */
export async function recordError(input: { message: string; path: string; source: 'server' | 'browser'; digest?: string; area?: SiteArea }) {
  try {
    const path = (input.path || '/').split('?')[0].slice(0, 200);
    const message = (input.message || 'Unknown error').replace(/\s+/g, ' ').trim().slice(0, 500);
    const area = input.area ?? areaOf(path);
    console.error(`[site error] ${area} ${path}: ${message}${input.digest ? ` (digest ${input.digest})` : ''}`);
    if (!appwrite) return;
    const id = idOf(area, path, message);
    const now = new Date().toISOString();
    const db = appwrite.tables;
    const found = await withTable(TABLES.siteErrors, () => db.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.siteErrors, rowId: id })).catch((e) => (isNotFound(e) ? null : Promise.reject(e)));
    const before = found ? (JSON.parse(found.data) as SiteError) : null;
    const next: SiteError = before
      ? { ...before, lastAt: now, count: before.count + 1, path, message, digest: input.digest ?? before.digest }
      : { id, area, path, message, source: input.source, firstAt: now, lastAt: now, count: 1, digest: input.digest };
    const alert = !before?.alertedAt || Date.now() - Date.parse(before.alertedAt) > ALERT_EVERY_MS;
    if (alert) next.alertedAt = now;
    const data = { area, lastAt: now, data: JSON.stringify(next) };
    if (found) await db.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.siteErrors, rowId: id, data });
    else await db.createRow({ databaseId: DATABASE_ID, tableId: TABLES.siteErrors, rowId: id, data }).catch((e) => ((e as { code?: number }).code === 409 ? undefined : Promise.reject(e)));
    if (alert) await alertByEmail(next, !before).catch((e) => console.error('[site error] alert email not sent', e));
  } catch (e) {
    console.error('[site error] could not be recorded', e);
  }
}

async function alertByEmail(err: SiteError, first: boolean) {
  const to = recipients();
  if (!to.length || !supportEmailConfigured()) return;
  await emailSupport(
    `${first ? 'New error' : 'Error still happening'} on the website: ${err.area}`,
    {
      Where: `${err.area} · ${err.path}`,
      Error: err.message,
      'How often': first ? 'First time' : `${err.count} times since ${new Date(err.firstAt).toUTCString()}`,
      ...(err.digest ? { 'Code (for Vercel logs)': err.digest } : {}),
    },
    undefined,
    { to, link: { href: `${siteUrl}/admin?tab=health`, label: 'Open Site health' }, footer: 'Sent by the Flokefama website’s monitoring. You get at most one email every 6 hours about the same error.' },
  );
}

/** The errors seen in the last `days` days, the latest first. */
export async function recentErrors(days = 14): Promise<SiteError[]> {
  if (!appwrite) return [];
  const since = new Date(Date.now() - days * 864e5).toISOString();
  try {
    const page = await appwrite.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId: TABLES.siteErrors, queries: [Query.greaterThan('lastAt', since), Query.orderDesc('lastAt'), Query.limit(200)] });
    return page.rows.flatMap((r) => {
      try {
        return [JSON.parse(r.data) as SiteError];
      } catch {
        return [];
      }
    });
  } catch (e) {
    if (isTableMissing(e)) return [];
    throw e;
  }
}

/** Clears an error from the list once it's dealt with (it comes back if it happens again). */
export async function dismissError(id: string) {
  if (!appwrite || !/^[0-9a-f]{32}$/.test(id)) return;
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.siteErrors, rowId: id }).catch((e) => (isNotFound(e) ? undefined : Promise.reject(e)));
}

export const monitorRecipients = recipients;
