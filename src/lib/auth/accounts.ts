import 'server-only';
import { cookies } from 'next/headers';
import { Query } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { signPayload, verifyPayload } from '@/lib/auth/session';

/**
 * Hospital accounts created with "Create an account".
 * - With Appwrite configured (lib/appwrite.ts): stored in the `accounts` table, so they work on any device.
 * - Without it: kept in a signed, httpOnly cookie in the browser that created them (tamper-proof, never
 *   readable by page scripts). Accounts made that way are copied into Appwrite the first time they sign in
 *   after Appwrite is switched on.
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

/**
 * Rounds of PBKDF2-SHA-256 for new passwords (OWASP's recommendation, 2023 onwards). The count is kept at the start
 * of the salt (`i600000$<salt>`), so it can be raised later; a salt without it is from before Nov 2026 (100,000
 * rounds), and that password is re-hashed with the current count the next time its owner signs in.
 */
export const PASSWORD_ROUNDS = 600_000;
const OLD_ROUNDS = 100_000;
const roundsOf = (salt: string) => {
  const m = /^i(\d{5,7})\$/.exec(salt);
  return m ? Number(m[1]) : OLD_ROUNDS;
};
/** Whether a stored password should be re-hashed (fewer rounds than today's). */
export const needsRehash = (salt: string) => roundsOf(salt) < PASSWORD_ROUNDS;

export async function hashPassword(password: string, salt = `i${PASSWORD_ROUNDS}$${hex(crypto.getRandomValues(new Uint8Array(16)))}`) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: roundsOf(salt) }, key, 256);
  return { salt, hash: hex(bits) };
}

/** Accounts kept in this browser's cookie (the fallback, and the source for moving accounts into Appwrite). */
async function readCookieAccounts(): Promise<StoredAccount[]> {
  const list = await verifyPayload<StoredAccount[]>((await cookies()).get(ACCOUNTS_COOKIE)?.value);
  return Array.isArray(list) ? list : [];
}

async function saveCookieAccount(account: StoredAccount) {
  const list = [...(await readCookieAccounts()).filter((a) => a.email !== account.email), account].slice(-MAX_ACCOUNTS);
  (await cookies()).set(ACCOUNTS_COOKIE, await signPayload(list), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

const fromRow = (r: Record<string, unknown>): StoredAccount => ({
  id: String(r.$id),
  name: String(r.name),
  email: String(r.email),
  organisation: String(r.organisation),
  phone: String(r.phone ?? ''),
  salt: String(r.salt),
  hash: String(r.hash),
});

/** Thrown when Appwrite is configured but can't be reached or refuses the request (wrong key, missing table…). */
export class AccountsUnavailable extends Error {
  name = 'AccountsUnavailable';
}

async function findByEmail(email: string): Promise<StoredAccount | null> {
  const e = email.trim().toLowerCase();
  if (!appwrite) return (await readCookieAccounts()).find((a) => a.email === e) ?? null;
  try {
    const res = await appwrite.tables.listRows({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.equal('email', e), Query.limit(1)] });
    return res.rows[0] ? fromRow(res.rows[0]) : null;
  } catch (err) {
    console.error('[accounts] Appwrite lookup failed (check APPWRITE_* in Vercel and run `npm run appwrite:setup`):', err);
    throw new AccountsUnavailable('accounts unavailable');
  }
}

/** The saved account with this email (for its profile), or null. */
export const findAccount = (email: string) => findByEmail(email);

/** Whether an account already uses this email. */
export async function accountExists(email: string) {
  return Boolean(await findByEmail(email));
}

export async function saveAccount(account: StoredAccount) {
  if (!appwrite) return saveCookieAccount(account);
  const { id, ...data } = account;
  try {
    await appwrite.tables.upsertRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id, data });
  } catch (err) {
    console.error('[accounts] Appwrite save failed:', err);
    throw new AccountsUnavailable('accounts unavailable');
  }
}

const sameHash = (a: string, b: string) => {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
};

/** The saved account for this email and password, or null. */
export async function findSavedAccount(email: string, password: string) {
  const account = await findByEmail(email);
  // Switching Appwrite on: an account made earlier in this browser is moved into the database on sign-in
  if (!account && appwrite) {
    const old = (await readCookieAccounts()).find((a) => a.email === email.trim().toLowerCase());
    if (old && sameHash((await hashPassword(password, old.salt)).hash, old.hash)) {
      await saveAccount(old).catch((e) => console.error('[accounts] could not move account to Appwrite:', e));
      return old;
    }
  }
  // No such account: the same work as checking a password, so the time taken doesn't reveal which emails exist
  if (!account) {
    await hashPassword(password);
    return null;
  }
  const { hash } = await hashPassword(password, account.salt);
  if (!sameHash(hash, account.hash)) return null;
  // A password hashed with fewer rounds than today's: hash it again now (the password is known only at this moment)
  if (needsRehash(account.salt)) {
    const upgraded = { ...account, ...(await hashPassword(password)) };
    await saveAccount(upgraded).catch((e) => console.error('[accounts] password not re-hashed (kept as it was):', e));
    return upgraded;
  }
  return account;
}

