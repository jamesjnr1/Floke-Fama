import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { signPayload, verifyPayload } from '@/lib/auth/session';

/**
 * The site monitor (/monitor) is for one person: whoever holds MONITOR_KEY (set in Vercel, 12+ characters). It has
 * nothing to do with the admin console's accounts: no admin, engineer or hospital can open it. Entering the key
 * signs this browser in for 30 days (a signed, HttpOnly cookie). Without MONITOR_KEY the dashboard is closed to all.
 *
 * MONITOR_TOKEN (optional, 24+ characters) lets a monitoring assistant read the site's health, errors and totals
 * (never the visitors) from /api/monitor/data?view=report with `Authorization: Bearer <token>`.
 */
export const OWNER_COOKIE = 'ff_owner';
const DAYS = 30;

const key = () => (process.env.MONITOR_KEY ?? process.env.OWNER_KEY)?.trim() ?? '';
export const ownerConfigured = () => key().length >= 12;

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const keyMatches = (given: string) => ownerConfigured() && same(given.trim(), key());

/** Is this browser signed in as the site's manager? */
export async function isOwner() {
  if (!ownerConfigured()) return false;
  const jar = await cookies();
  const p = await verifyPayload<{ owner?: boolean; exp?: number }>(jar.get(OWNER_COOKIE)?.value);
  return Boolean(p?.owner && typeof p.exp === 'number' && p.exp > Date.now() / 1000);
}

export async function signInOwner() {
  const jar = await cookies();
  const exp = Math.floor(Date.now() / 1000) + DAYS * 86400;
  jar.set(OWNER_COOKIE, await signPayload({ owner: true, exp }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: DAYS * 86400 });
}

export async function signOutOwner() {
  (await cookies()).delete(OWNER_COOKIE);
}

/** A request carrying the monitoring token (read-only, totals and errors only). */
export function hasMonitorToken(req: Request) {
  const token = process.env.MONITOR_TOKEN?.trim() ?? '';
  return token.length >= 24 && same(req.headers.get('authorization') ?? '', `Bearer ${token}`);
}

/** What the dashboard and its emails call the site's manager (MONITOR_NAME, else Jonathan). */
export const ownerName = () => (process.env.MONITOR_NAME ?? process.env.OWNER_NAME)?.trim().slice(0, 40) || 'Jonathan';
