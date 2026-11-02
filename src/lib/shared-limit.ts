import 'server-only';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { withTable } from '@/lib/appwrite-tables';

/**
 * Limits shared by every server: wrong passwords, new accounts, engineer registrations and the Support form.
 * On Vercel the site runs on several servers at once, each with its own memory, so a count kept in memory
 * could be beaten by spreading attempts across them. These counts live in Appwrite (table rate_limits: one
 * row per key, holding the times of its recent attempts), so all servers see the same count.
 *
 * Without Appwrite, or when it can't be reached, each server falls back to its own count in memory: a limit
 * never stops someone because the database is down, and never disappears either.
 */

const memory = new Map<string, number[]>();
const MAX_KEPT = 50;

/** A row id for any key (Appwrite allows up to 36 of a-z, 0-9, ., -, _): a SHA-256 of the key, so no address is stored. */
async function rowId(key: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return 'rl_' + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

const recent = (times: number[], windowMs: number, now = Date.now()) => times.filter((t) => now - t < windowMs);
const parse = (raw: unknown) =>
  String(raw ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

async function read(key: string): Promise<number[] | null> {
  if (!appwrite) return null;
  try {
    const id = await rowId(key);
    return await withTable(TABLES.rateLimits, async () => {
      try {
        const row = await appwrite!.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.rateLimits, rowId: id });
        return parse((row as unknown as { hits?: string }).hits);
      } catch (e) {
        if ((e as { code?: number })?.code === 404 && !/table/i.test(String((e as { type?: string }).type))) return [];
        throw e;
      }
    });
  } catch (e) {
    console.error('[limits] shared count unavailable, using this server only:', (e as Error)?.message ?? e);
    return null;
  }
}

async function write(key: string, times: number[]) {
  if (!appwrite) return;
  try {
    const id = await rowId(key);
    await withTable(TABLES.rateLimits, () =>
      appwrite!.tables.upsertRow({ databaseId: DATABASE_ID, tableId: TABLES.rateLimits, rowId: id, data: { hits: times.slice(-MAX_KEPT).join(',') } }),
    );
  } catch (e) {
    console.error('[limits] shared count not saved:', (e as Error)?.message ?? e);
  }
}

/** The attempts for `key` within the window, from Appwrite (or this server's memory). */
async function attempts(key: string, windowMs: number) {
  const shared = await read(key);
  // Appwrite answered: its count is the true one (a correct password elsewhere may have cleared it), and this
  // server's memory follows it. Appwrite down: this server's own count, so the limit still holds
  if (shared) {
    if (shared.length) memory.set(key, shared.slice(-MAX_KEPT));
    else memory.delete(key);
    return recent(shared, windowMs);
  }
  return recent(memory.get(key) ?? [], windowMs);
}

/** True when `key` has reached `max` attempts within `windowMs`. Does not record anything. */
export async function overLimit(key: string, max: number, windowMs: number) {
  return (await attempts(key, windowMs)).length >= max;
}

/** Records one attempt for `key`. */
export async function recordAttempt(key: string, windowMs: number) {
  const times = [...(await attempts(key, windowMs)), Date.now()];
  memory.set(key, times.slice(-MAX_KEPT));
  if (memory.size > 10_000) memory.delete(memory.keys().next().value!);
  await write(key, times);
}

/** Forgets `key` (e.g. after a correct password). */
export async function clearAttempts(key: string) {
  memory.delete(key);
  if (!appwrite) return;
  try {
    const id = await rowId(key);
    await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.rateLimits, rowId: id }).catch(() => {});
  } catch {
    /* nothing to forget */
  }
}

/** True when `key` was already used `max` times within `windowMs`; otherwise records this use (forms). */
export async function sharedLimited(key: string, max: number, windowMs: number) {
  if (await overLimit(key, max, windowMs)) return true;
  await recordAttempt(key, windowMs);
  return false;
}
