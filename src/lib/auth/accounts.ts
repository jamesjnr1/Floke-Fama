import 'server-only';
import { cookies } from 'next/headers';
import { signPayload, verifyPayload } from '@/lib/auth/session';

/**
 * Customer accounts created with "Create an account". There is no database yet, so accounts are kept in a
 * signed, httpOnly cookie in the browser that created them (tamper-proof, never readable by page scripts).
 * Swap `readAccounts` / `saveAccount` for a database (e.g. Supabase or Postgres) and nothing else changes.
 */
export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  organisation: string;
  phone: string;
  /** PBKDF2-SHA-256 of the password, with its salt. */
  salt: string;
  hash: string;
}

const ACCOUNTS_COOKIE = 'ff_accounts';
const MAX_ACCOUNTS = 5; // keeps the cookie small; the oldest is dropped

const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function hashPassword(password: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100_000 }, key, 256);
  return { salt, hash: hex(bits) };
}

export async function readAccounts(): Promise<StoredAccount[]> {
  const list = await verifyPayload<StoredAccount[]>((await cookies()).get(ACCOUNTS_COOKIE)?.value);
  return Array.isArray(list) ? list : [];
}

export async function saveAccount(account: StoredAccount) {
  const list = [...(await readAccounts()).filter((a) => a.email !== account.email), account].slice(-MAX_ACCOUNTS);
  (await cookies()).set(ACCOUNTS_COOKIE, await signPayload(list), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** The saved account for this email and password, or null. */
export async function findSavedAccount(email: string, password: string) {
  const account = (await readAccounts()).find((a) => a.email === email.trim().toLowerCase());
  if (!account) return null;
  const { hash } = await hashPassword(password, account.salt);
  let diff = hash.length ^ account.hash.length;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ (account.hash.charCodeAt(i) || 0);
  return diff === 0 ? account : null;
}
