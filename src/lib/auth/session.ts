/**
 * Signed session tokens (HMAC-SHA-256 via Web Crypto), usable in middleware (edge) and on the server.
 * Token = base64url(JSON payload) + "." + base64url(signature).
 */
/**
 * client: a hospital or facility account (everyone who signs up on the site). engineer: Flokefama's service engineers.
 * admin: the site administrators (the /admin console).
 */
export type Role = 'client' | 'engineer' | 'admin';

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  role: Role;
  /** Hospital / facility / organisation the account belongs to. */
  facility?: string;
  phone?: string;
  /** "Keep me signed in on this device": the session lasts 30 days instead of an hour. */
  keep?: boolean;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export const SESSION_COOKIE = 'ff_session';
/** The admin console's own session, kept apart from the site's: an admin signed in there is not signed in on the site. */
export const ADMIN_COOKIE = 'ff_admin';
/** The engineer portal's own session, kept apart from the site's too: the site is for hospitals only. */
export const ENGINEER_COOKIE = 'ff_engineer';
/** Each role's session cookie: hospitals on the site (ff_session), engineers and admins in their own areas. */
export const cookieFor = (role: Role) => (role === 'admin' ? ADMIN_COOKIE : role === 'engineer' ? ENGINEER_COOKIE : SESSION_COOKIE);
/** Sign-out after this long without activity: every visit to the site renews the session (sliding expiry). */
export const SESSION_TTL_SECONDS = 60 * 60; // 1 hour
/** With "Keep me signed in": 30 days without use (still renewed by every visit). */
export const KEEP_TTL_SECONDS = 60 * 60 * 24 * 30;
export const ttlFor = (user: { keep?: boolean }) => (user.keep ? KEEP_TTL_SECONDS : SESSION_TTL_SECONDS);

/** Each role's own sign-in page: hospitals at /login, engineers and admins apart from them. */
export const roleLogin: Record<Role, string> = { client: '/login', engineer: '/engineer/login', admin: '/admin/login' };

/** Where each role lands after signing in. */
export const roleHome: Record<Role, string> = { client: '/portal', engineer: '/engineer', admin: '/admin' };

/** Areas only one role may open. Everything else (shop, checkout, quotes) is open to any signed-in user. */
export const roleAreas: { prefix: string; role: Role }[] = [
  { prefix: '/portal', role: 'client' },
  { prefix: '/engineer', role: 'engineer' },
  { prefix: '/admin', role: 'admin' },
];

/** Pages that need a signed-in user of any role. */
export const signedInAreas = ['/checkout'];

/** Where a role may be sent after signing in: anywhere on the site except another role's area. */
export function nextFor(role: Role, next: string | null) {
  if (!next || Object.values(roleLogin).some((l) => next === l || next.startsWith(`${l}?`) || next.startsWith(`${l}/`))) return roleHome[role];
  const area = roleAreas.find((a) => next === a.prefix || next.startsWith(`${a.prefix}/`));
  return area && area.role !== role ? roleHome[role] : next;
}

/**
 * The key that signs sessions. Set SESSION_SECRET (32+ random characters) in Vercel. Without it a key is derived
 * from the Appwrite API key (also private); with neither, production uses a random key per server instance, so
 * sessions can never be forged (visitors may just be asked to sign in again). Only local development and previews
 * fall back to a fixed key.
 */
const secret =
  process.env.SESSION_SECRET?.trim() ||
  (process.env.APPWRITE_API_KEY?.trim() ? `ff-session:${process.env.APPWRITE_API_KEY.trim()}` : '') ||
  (process.env.VERCEL_ENV === 'production' ? crypto.randomUUID() + crypto.randomUUID() : 'flokefama-preview-only-secret--set-SESSION_SECRET');

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
  return signPayload({ ...user, exp: Math.floor(Date.now() / 1000) + ttlFor(user) } satisfies SessionUser);
}

/** Cookie options for a session (also used when middleware renews it). */
export const sessionCookie = (user: { keep?: boolean }) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ttlFor(user),
});

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
