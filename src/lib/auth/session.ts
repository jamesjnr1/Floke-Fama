/**
 * Signed session tokens (HMAC-SHA-256 via Web Crypto), usable in middleware (edge) and on the server.
 * Token = base64url(JSON payload) + "." + base64url(signature).
 */
export type Role = 'client' | 'engineer';

export interface SessionUser {
  sub: string;
  name: string;
  email: string;
  role: Role;
  /** Hospital / facility the account belongs to (client accounts). */
  facility?: string;
  /** Expiry, seconds since epoch. */
  exp: number;
}

export const SESSION_COOKIE = 'ff_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

/** Where each role lands after signing in. */
export const roleHome: Record<Role, string> = { client: '/portal', engineer: '/engineer' };

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

export async function signSession(user: Omit<SessionUser, 'exp'>): Promise<string> {
  const payload: SessionUser = { ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)));
  return `${body}.${toB64Url(sig)}`;
}

/** Returns the session if the signature is valid and it hasn't expired; otherwise null. */
export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(), fromB64Url(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as SessionUser;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    if (payload.role !== 'client' && payload.role !== 'engineer') return null;
    return payload;
  } catch {
    return null;
  }
}

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}
