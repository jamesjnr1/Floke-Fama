import 'server-only';

/**
 * The site's database on Supabase (Postgres), answering the same calls the site made to Appwrite: listRows, getRow,
 * createRow, updateRow, upsertRow and deleteRow with Appwrite's Query strings, and createFile and deleteFile for the
 * logos and photos. So the rest of the site is unchanged: lib/appwrite.ts hands this out when Supabase is set up.
 *
 * Talks to Supabase's own web API with the server's secret key (SUPABASE_SECRET_KEY, or the older
 * SUPABASE_SERVICE_ROLE_KEY), which never reaches the browser. The tables and the flk_* functions it calls are made
 * by supabase/schema.sql.
 */
type Row = Record<string, unknown> & { $id: string; $createdAt: string; $updatedAt: string };
type Ref = { databaseId?: string; tableId: string };
type ListArgs = Ref & { queries?: string[] };
type RowArgs = Ref & { rowId: string; queries?: string[] };
type DataArgs = Ref & { rowId: string; data?: Record<string, unknown>; permissions?: string[] };
type InputFileLike = { source: { type: 'buffer'; data: Uint8Array } | { type: 'blob'; data: Blob } | { type: string; data?: unknown }; filename: string };

export class DbError extends Error {
  constructor(message: string, readonly code: number, readonly type = '') {
    super(message);
  }
}

const types: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml' };

export function supabaseDb(url: string, key: string) {
  const base = url.replace(/\/$/, '');
  // The new secret keys go in `apikey` only; the older service-role keys (JWTs) also as a bearer token
  const auth: Record<string, string> = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };

  async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return (await res.json()) as T;
    const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    // Postgres "no row" and "already exists" read as Appwrite's 404 and 409, which the site already handles
    const code = body.code === 'P0002' ? 404 : body.code === '23505' ? 409 : res.status;
    throw new DbError(body.message ?? `Supabase answered ${res.status}`, code, body.code ?? '');
  }

  /** Appwrite's Query strings as the filters, order, limit and starting point flk_list takes. */
  function parse(queries: string[] = []) {
    const out: { filters: { method: string; attribute: string; values: unknown[] }[]; order: string | null; desc: boolean; limit: number; after: string | null } = { filters: [], order: null, desc: false, limit: 25, after: null };
    for (const q of queries) {
      const { method, attribute, values = [] } = JSON.parse(q) as { method: string; attribute?: string; values?: unknown[] };
      if (method === 'limit') out.limit = Number(values[0]) || 25;
      else if (method === 'cursorAfter') out.after = String(values[0]);
      else if (method === 'orderDesc' || method === 'orderAsc') {
        out.order = attribute ?? null;
        out.desc = method === 'orderDesc';
      } else if (method === 'select') continue; // whole rows come back; the fields asked for are among them
      else if (['equal', 'greaterThan', 'greaterThanEqual', 'lessThan', 'lessThanEqual'].includes(method)) out.filters.push({ method, attribute: attribute ?? '', values });
      else throw new DbError(`The database does not support the query "${method}"`, 400);
    }
    return out;
  }

  const tables = {
    async listRows<T = Row>({ tableId, queries }: ListArgs): Promise<{ total: number; rows: T[] }> {
      const q = parse(queries);
      return rpc('flk_list', { p_table: tableId, p_filters: q.filters, p_order: q.order, p_desc: q.desc, p_limit: q.limit, p_after: q.after });
    },
    getRow: <T = Row>({ tableId, rowId }: RowArgs) => rpc<T>('flk_get', { p_table: tableId, p_id: rowId }),
    createRow: <T = Row>({ tableId, rowId, data }: DataArgs) => rpc<T>('flk_create', { p_table: tableId, p_id: rowId, p_doc: data ?? {} }),
    updateRow: <T = Row>({ tableId, rowId, data }: DataArgs) => rpc<T>('flk_update', { p_table: tableId, p_id: rowId, p_doc: data ?? {} }),
    upsertRow: <T = Row>({ tableId, rowId, data }: DataArgs) => rpc<T>('flk_upsert', { p_table: tableId, p_id: rowId, p_doc: data ?? {} }),
    deleteRow: ({ tableId, rowId }: RowArgs) => rpc<Record<string, never>>('flk_delete', { p_table: tableId, p_id: rowId }),
  };

  const storage = {
    async createFile({ bucketId, fileId, file }: { bucketId: string; fileId: string; file: InputFileLike }) {
      const { source, filename } = file;
      const body = source.type === 'blob' ? new Uint8Array(await (source.data as Blob).arrayBuffer()) : (source.data as Uint8Array);
      const res = await fetch(`${base}/storage/v1/object/${bucketId}/${encodeURIComponent(fileId)}`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': types[filename.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream', 'x-upsert': 'true', 'Cache-Control': 'max-age=31536000' },
        body: body as BodyInit,
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new DbError(`The file was not stored (${res.status}): ${(await res.text().catch(() => '')).slice(0, 160)}`, res.status);
      return { $id: fileId, name: filename };
    },
    async deleteFile({ bucketId, fileId }: { bucketId: string; fileId: string }) {
      const res = await fetch(`${base}/storage/v1/object/${bucketId}/${encodeURIComponent(fileId)}`, { method: 'DELETE', headers: auth, signal: AbortSignal.timeout(10_000) });
      if (!res.ok && res.status !== 404) throw new DbError(`The file was not removed (${res.status})`, res.status);
      return {};
    },
  };

  /** The public address of a stored picture (the bucket can be read by anyone; only the server writes). */
  const fileUrl = (bucketId: string, fileId: string, version?: string) => `${base}/storage/v1/object/public/${bucketId}/${encodeURIComponent(fileId)}${version ? `?v=${encodeURIComponent(version)}` : ''}`;

  return { tables, storage, fileUrl };
}
