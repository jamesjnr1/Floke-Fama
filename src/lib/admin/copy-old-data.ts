import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { appwrite, appwriteOld, BUCKETS, DATABASE_ID, TABLES, usingSupabase } from '@/lib/appwrite';

/**
 * Copies everything from the old Appwrite database into Supabase (the admin console's Database & settings): every
 * row of every table, with its original id and times, and the hospital logos and staff photos. Rows keep their ids,
 * so it can be run again safely: a row already copied is copied over with the same data. A row made in Supabase
 * since the switch is never touched, unless Appwrite has a row with the same id (a day's monitor totals, a limit).
 * An account whose email has since been registered again in Supabase is left as the new one.
 */
export type CopyReport = { ok: boolean; message: string; tables: { table: string; rows: number; skipped: number }[]; files: number; filesFailed: number };

const supabaseUrl = () => process.env.SUPABASE_URL!.trim().replace(/\/$/, '');
const supabaseKey = () => (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!.trim();

async function importRows(table: string, rows: Models.Row[]) {
  const key = supabaseKey();
  const send = async (batch: Models.Row[]) => {
    const res = await fetch(`${supabaseUrl()}/rest/v1/rpc/flk_import`, {
      method: 'POST',
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_table: table, p_rows: batch }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error((await res.text().catch(() => '')).slice(0, 200) || `Supabase answered ${res.status}`);
  };
  let copied = 0;
  let skipped = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    try {
      await send(batch);
      copied += batch.length;
    } catch {
      // One row in the batch clashes (an email registered again since the switch): copy them one by one
      for (const r of batch) {
        try {
          await send([r]);
          copied++;
        } catch {
          skipped++;
        }
      }
    }
  }
  return { copied, skipped };
}

export async function copyOldData(): Promise<CopyReport> {
  const report: CopyReport = { ok: false, message: '', tables: [], files: 0, filesFailed: 0 };
  if (!usingSupabase || !appwrite) return { ...report, message: 'The site is not on Supabase yet (SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel).' };
  const old = appwriteOld;
  if (!old) return { ...report, message: 'Appwrite’s settings (APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY) are no longer in Vercel, so the old data can’t be read.' };
  const logoRows: (Models.Row & { fileId?: string })[] = [];
  for (const table of Object.values(TABLES)) {
    const rows: Models.Row[] = [];
    try {
      let cursor: string | undefined;
      for (;;) {
        const page = await old.tables.listRows({ databaseId: DATABASE_ID, tableId: table, queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
        rows.push(...page.rows);
        if (page.rows.length < 500) break;
        cursor = page.rows[page.rows.length - 1].$id;
      }
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      // A table that was never made in Appwrite has nothing to copy
      if (/not.?found|could not be found/i.test(msg)) {
        report.tables.push({ table, rows: 0, skipped: 0 });
        continue;
      }
      return { ...report, message: `Appwrite did not answer: ${msg}` };
    }
    if (table === TABLES.hospitalLogos) logoRows.push(...(rows as (Models.Row & { fileId?: string })[]));
    const { copied, skipped } = await importRows(table, rows);
    report.tables.push({ table, rows: copied, skipped });
  }
  // The logos and photos: each file keeps its id, so the copied rows point at it
  for (const r of logoRows) {
    if (!r.fileId) continue;
    try {
      const res = await fetch(`${old.endpoint}/storage/buckets/${BUCKETS.hospitalLogos}/files/${r.fileId}/view?project=${old.projectId}`, { headers: { 'X-Appwrite-Project': old.projectId, 'X-Appwrite-Key': old.apiKey }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(String(res.status));
      const type = res.headers.get('content-type') ?? '';
      const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('svg') ? 'svg' : 'jpg';
      await appwrite.storage.createFile({ bucketId: BUCKETS.hospitalLogos, fileId: r.fileId, file: InputFile.fromBuffer(new Uint8Array(await res.arrayBuffer()), `copy.${ext}`) });
      report.files++;
    } catch {
      report.filesFailed++;
    }
  }
  const rows = report.tables.reduce((n, t) => n + t.rows, 0);
  const skipped = report.tables.reduce((n, t) => n + t.skipped, 0);
  return { ...report, ok: true, message: `Copied ${rows} rows and ${report.files} pictures from Appwrite.${skipped ? ` ${skipped} left as they are (already registered again since the switch).` : ''}${report.filesFailed ? ` ${report.filesFailed} pictures could not be copied.` : ''}` };
}
