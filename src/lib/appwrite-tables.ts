import 'server-only';
import { TablesDBIndexType } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';

/**
 * Tables added after the first `npm run appwrite:setup` are created by the site itself the first time it needs
 * them, so a new feature works without anyone running the setup again. Same columns as scripts/appwrite-setup.mjs.
 */
type Column = { key: string; size?: number; required: boolean };
const specs: Record<string, { name: string; columns: Column[]; indexes?: { key: string; columns: string[] }[] }> = {
  [TABLES.pushSubscriptions]: {
    name: 'Alert devices',
    columns: [{ key: 'account', size: 254, required: true }, { key: 'role', size: 16, required: true }, { key: 'facility', size: 160, required: false }, { key: 'data', required: true }],
    indexes: [{ key: 'role_facility', columns: ['role', 'facility'] }],
  },
  [TABLES.supportRequests]: {
    name: 'Support requests',
    columns: [{ key: 'status', size: 16, required: true }, { key: 'facility', size: 160, required: false }, { key: 'data', required: true }],
  },
  [TABLES.smsLog]: {
    name: 'Text messages',
    columns: [
      { key: 'kind', size: 32, required: true },
      { key: 'ref', size: 64, required: false },
      { key: 'to', size: 400, required: true },
      { key: 'text', size: 320, required: true },
      { key: 'status', size: 16, required: true },
      { key: 'detail', size: 200, required: false },
    ],
  },
};

/** True when Appwrite says the table doesn't exist. */
export const isTableMissing = (e: unknown) => {
  const err = e as { code?: number; type?: string; message?: string };
  return err?.code === 404 && /table_not_found|collection_not_found|table with the requested id/i.test(`${err.type} ${err.message}`);
};

const ignoreExists = (e: unknown) => {
  if ((e as { code?: number })?.code !== 409) throw e;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function create(tableId: string) {
  const spec = specs[tableId];
  if (!spec) throw new Error(`no definition for table ${tableId}`);
  const db = appwrite!.tables;
  await db.createTable({ databaseId: DATABASE_ID, tableId, name: spec.name, permissions: [], rowSecurity: false }).catch(ignoreExists);
  for (const c of spec.columns) {
    const base = { databaseId: DATABASE_ID, tableId, key: c.key, required: c.required };
    await (c.size ? db.createVarcharColumn({ ...base, size: c.size }) : db.createLongtextColumn(base)).catch(ignoreExists);
  }
  // Columns are created in the background: wait until they can be written to
  for (let i = 0; i < 20; i++) {
    const { columns } = await db.listColumns({ databaseId: DATABASE_ID, tableId });
    if ((columns as { status?: string }[]).every((c) => c.status !== 'processing')) break;
    await sleep(750);
  }
  for (const ix of spec.indexes ?? []) await db.createIndex({ databaseId: DATABASE_ID, tableId, key: ix.key, type: TablesDBIndexType.Key, columns: ix.columns }).catch(ignoreExists);
}

const creating = new Map<string, Promise<void>>();

/** Runs `work`; if its table doesn't exist yet, creates the table and runs it once more. */
export async function withTable<T>(tableId: string, work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (e) {
    if (!isTableMissing(e)) throw e;
    if (!creating.has(tableId)) creating.set(tableId, create(tableId).finally(() => creating.delete(tableId)));
    await creating.get(tableId);
    return work();
  }
}
