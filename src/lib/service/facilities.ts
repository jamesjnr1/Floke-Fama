import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { roleFor } from '@/lib/auth/users';
import { facilityKey } from '@/lib/service/desk';

/** The hospitals with an account (their names exactly as registered), so they have a portal. */
export async function registeredFacilities(): Promise<string[]> {
  if (!appwrite) return [];
  const names: string[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const page = await appwrite.tables.listRows<Models.Row & { email: string; organisation: string }>({
      databaseId: DATABASE_ID,
      tableId: TABLES.accounts,
      queries: [Query.select(['$id', 'email', 'organisation']), Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    for (const r of page.rows) if (r.organisation && roleFor(r.email ?? '', r.$id) === 'client') names.push(r.organisation);
    if (page.rows.length < 500) break;
    cursor = page.rows[page.rows.length - 1].$id;
  }
  return names;
}

/**
 * The hospital name to file a Support page caller's machine under: a hospital already on record or registered with
 * the same name (ignoring capitals, spaces and punctuation) keeps its own spelling, so the job shows in its portal.
 */
export async function canonicalFacility(typed: string, known: string[]) {
  const k = facilityKey(typed);
  const found = known.find((f) => facilityKey(f) === k) ?? (await registeredFacilities().catch(() => [])).find((f) => facilityKey(f) === k);
  return found ?? typed;
}
