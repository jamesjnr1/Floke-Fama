// Creates what the website needs in Appwrite: the database, its tables (with columns and indexes) and the
// logo bucket. Safe to run again: anything that already exists is left as it is.
//
// Usage: npm run appwrite:setup   (reads APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY and the
// optional APPWRITE_DATABASE_ID from the environment or .env.local)
// The key needs the scopes databases.read/write, tables.read/write, columns.read/write, indexes.read/write,
// buckets.read/write.
import { Client, Compression, Permission, Role, Storage, TablesDB } from 'node-appwrite';

const { APPWRITE_ENDPOINT: endpoint, APPWRITE_PROJECT_ID: project, APPWRITE_API_KEY: key } = process.env;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'flokefama';
if (!endpoint || !project || !key) {
  console.error('Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY first (see .env.example).');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(key);
const db = new TablesDB(client);
const storage = new Storage(client);
const exists = (e) => e?.code === 409;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function step(label, fn) {
  try {
    await fn();
    console.log(`✔ ${label}`);
  } catch (e) {
    if (exists(e)) return console.log(`· ${label} (already there)`);
    console.error(`✘ ${label}: ${e.message}`);
    throw e;
  }
}

/** Columns are created in the background; indexes can only be added once they are ready. */
async function waitForColumns(tableId) {
  for (let i = 0; i < 30; i++) {
    const { columns } = await db.listColumns({ databaseId, tableId });
    if (columns.every((c) => c.status === 'available')) return;
    if (columns.some((c) => c.status === 'failed')) throw new Error(`a column in ${tableId} failed to create`);
    await sleep(1000);
  }
  throw new Error(`columns in ${tableId} are still being created; run the setup again in a minute`);
}

const text = (key, size, required = true) => ({ kind: 'varchar', key, size, required });
const json = (key) => ({ kind: 'longtext', key, required: true });

const tables = [
  {
    id: 'accounts',
    name: 'Hospital accounts',
    columns: [text('name', 120), { kind: 'email', key: 'email', required: true }, text('organisation', 160), text('phone', 40, false), text('salt', 64), text('hash', 128)],
    indexes: [{ key: 'email_unique', type: 'unique', columns: ['email'] }],
  },
  {
    id: 'hospital_logos',
    name: 'Hospital logos',
    columns: [text('fileId', 36), text('facility', 160, false)],
    indexes: [],
  },
  // Orders and the service desk: each row holds the item as JSON in `data`, plus the columns used to find it.
  {
    id: 'orders',
    name: 'Orders',
    columns: [text('account', 254), json('data')],
    indexes: [{ key: 'account', type: 'key', columns: ['account'] }],
  },
  {
    id: 'service_assets',
    name: 'Service desk: equipment',
    columns: [text('facility', 160, false), json('data')],
    indexes: [],
  },
  {
    id: 'service_tickets',
    name: 'Service desk: requests',
    columns: [text('facility', 160, false), json('data')],
    indexes: [],
  },
  {
    id: 'service_notifications',
    name: 'Service desk: notifications',
    columns: [text('audience', 16), json('data')],
    indexes: [],
  },
];

try {
  // Use the database if it is already there (creating it again would hit the plan's database limit)
  const found = await db.get({ databaseId }).catch((e) => (e?.code === 404 ? null : Promise.reject(e)));
  if (found) console.log(`· database "${databaseId}" (${found.name}, already there)`);
  else await step(`database "${databaseId}"`, () => db.create({ databaseId, name: 'Flokefama website' }));
} catch (e) {
  // The free plan allows one database: point APPWRITE_DATABASE_ID at the one the project already has
  if (e?.type !== 'additional_resource_not_allowed') throw e;
  const { databases } = await db.list();
  console.error(`\nThis Appwrite plan allows no more databases. Existing: ${databases.map((d) => `${d.$id} (${d.name})`).join(', ') || 'none'}.`);
  console.error('Set APPWRITE_DATABASE_ID to the one to use (in .env.local and in Vercel) and run the setup again.');
  process.exit(1);
}

for (const t of tables) {
  // No table permissions: only the website's server (with its API key) can read or write these rows.
  const table = await db.getTable({ databaseId, tableId: t.id }).catch((e) => (e?.code === 404 ? null : Promise.reject(e)));
  if (table) console.log(`· table "${t.id}" (already there)`);
  else await step(`table "${t.id}"`, () => db.createTable({ databaseId, tableId: t.id, name: t.name, permissions: [], rowSecurity: false }));
  for (const c of t.columns) {
    const base = { databaseId, tableId: t.id, key: c.key, required: c.required };
    await step(`  column ${t.id}.${c.key}`, () => (c.kind === 'email' ? db.createEmailColumn(base) : c.kind === 'longtext' ? db.createLongtextColumn(base) : db.createVarcharColumn({ ...base, size: c.size })));
  }
  await waitForColumns(t.id);
  for (const ix of t.indexes) await step(`  index ${t.id}.${ix.key}`, () => db.createIndex({ databaseId, tableId: t.id, key: ix.key, type: ix.type, columns: ix.columns }));
}

// Logos are public pictures: anyone may view them, only the server may add or remove them.
// (Checked first: creating it again would hit the plan's bucket limit before reporting it exists.)
const bucket = await storage.getBucket({ bucketId: 'hospital-logos' }).catch((e) => (e?.code === 404 ? null : Promise.reject(e)));
if (bucket) console.log('· bucket "hospital-logos" (already there)');
else await step('bucket "hospital-logos"', () =>
  storage.createBucket({
    bucketId: 'hospital-logos',
    name: 'Hospital logos',
    permissions: [Permission.read(Role.any())],
    fileSecurity: false,
    maximumFileSize: 600 * 1024,
    allowedFileExtensions: ['webp', 'png', 'jpg', 'jpeg'],
    compression: Compression.None,
    encryption: false,
    antivirus: true,
  }),
);

console.log('\nAppwrite is ready for the website.');
