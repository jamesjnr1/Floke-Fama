/**
 * Signed session tokens (HMAC-SHA-256 via Web Crypto), usable in middleware (edge) and on the server.
 * Token = base64url(JSON payload) + "." + base64url(signature).
 */
/** customer: anyone who signs up on the site (shop, checkout, quotes). client: a hospital on the service portal. */
export type Role = 'customer' | 'client' | 'engineer';

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  role: Role;
  /** Hospital / facility / organisation the account belongs to. */
  facility?: string;
  phone?: string;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export const SESSION_COOKIE = 'ff_session';
/** Sign-out after this long without activity: every visit to the site renews the session (sliding expiry). */
export const SESSION_TTL_SECONDS = 60 * 60; // 1 hour

/** Where each role lands after signing in. */
export const roleHome: Record<Role, string> = { customer: '/account', client: '/portal', engineer: '/engineer' };

/** Areas only one role may open. Everything else (shop, checkout, account) is open to any signed-in user. */
export const roleAreas: { prefix: string; role: Role }[] = [
  { prefix: '/portal', role: 'client' },
  { prefix: '/engineer', role: 'engineer' },
];

/** Pages that need a signed-in user of any role. */
export const signedInAreas = ['/checkout', '/quote', '/account'];

/** Where a role may be sent after signing in: anywhere on the site except another role's area. */
export function nextFor(role: Role, next: string | null) {
  if (!next || next.startsWith('/login')) return roleHome[role];
  const area = roleAreas.find((a) => next === a.prefix || next.startsWith(`${a.prefix}/`));
  return area && area.role !== role ? roleHome[role] : next;
}

/**
 * IMPORTANT: set SESSION_SECRET (32+ random characters) in Vercel before real accounts or data
 * are connected. The fallback exists only so preview deployments with demo data work out of the box.
 */
const secret = process.env.SESSION_SECRET?.trim() || 'flokefama-preview-only-secret--set-SESSION_SECRET';

const enc = new TextEncoder();
let keyPromise: Promise<CryptoKey> | null = null;
const key = () => (keyPromise ??= crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']));

const toB64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64Url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

/** Signs any JSON payload (also used for the browser's saved accounts). */
export async function signPayload(payload: unknown): Promise<string> {
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)));
  return `${body}.${toB64Url(sig)}`;
}

/** The payload of a token signed with `signPayload`, or null if it was tampered with. */
export async function verifyPayload<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    if (!(await crypto.subtle.verify('HMAC', await key(), fromB64Url(sig), enc.encode(body)))) return null;
    return JSON.parse(new TextDecoder().decode(fromB64Url(body))) as T;
  } catch {
    return null;
  }
}

export async function signSession(user: Omit<SessionUser, 'exp'>): Promise<string> {
  return signPayload({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS } satisfies SessionUser);
}

/** Cookie options for the session (also used when middleware renews it). */
export const sessionCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};

/** Returns the session if the signature is valid and it hasn't expired; otherwise null. */
export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  const payload = await verifyPayload<SessionUser>(token);
  if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
  if (!(payload.role in roleHome)) return null;
  return payload;
}

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}
