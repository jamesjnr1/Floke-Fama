import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, BUCKETS, DATABASE_ID, fileUrl, TABLES } from '@/lib/appwrite';

/**
 * Each account's picture: an engineer's photo or a hospital's logo. Both are kept the same way (a file in the
 * `hospital-logos` bucket and a row in `hospital_logos` keyed by the account), so no extra setup is needed.
 */
type Row = Models.Row & { fileId: string; facility: string };

/** Marks a row as an engineer's photo rather than a hospital's logo. */
export const PHOTO_MARK = 'engineer-photo';

/** Every account's picture address, by account id. */
export async function accountPictures(): Promise<Record<string, string>> {
  if (!appwrite) return {};
  const out: Record<string, string> = {};
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const { rows } = await appwrite.tables.listRows<Row>({
      databaseId: DATABASE_ID,
      tableId: TABLES.hospitalLogos,
      queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    for (const r of rows) {
      const url = fileUrl(BUCKETS.hospitalLogos, r.fileId, r.$updatedAt);
      if (url) out[r.$id] = url;
    }
    if (rows.length < 500) break;
    cursor = rows[rows.length - 1].$id;
  }
  return out;
}
