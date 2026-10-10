import 'server-only';
import { Client, Storage, TablesDB } from 'node-appwrite';

/**
 * Appwrite (database + file storage), used on the server only. The API key never reaches the browser.
 * Configured with APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY (see .env.example); without
 * them `appwrite` is null and the site keeps its built-in fallbacks (accounts in a signed cookie, logos in
 * the browser). Create the tables and the bucket with `npm run appwrite:setup`.
 */
const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

/** Names of the database, tables and bucket (also used by scripts/appwrite-setup.mjs). */
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'flokefama';
export const TABLES = {
  accounts: 'accounts',
  hospitalLogos: 'hospital_logos',
  orders: 'orders',
  serviceAssets: 'service_assets',
  serviceTickets: 'service_tickets',
  serviceNotifications: 'service_notifications',
  pushSubscriptions: 'push_subscriptions',
} as const;
export const BUCKETS = { hospitalLogos: 'hospital-logos' } as const;

export const appwrite =
  endpoint && projectId && apiKey
    ? (() => {
        const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
        return { tables: new TablesDB(client), storage: new Storage(client), endpoint, projectId };
      })()
    : null;

/** Public address of a stored file (the logos bucket can be read by anyone; only the server can write). */
export const fileUrl = (bucketId: string, fileId: string, version?: string) =>
  appwrite ? `${appwrite.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${appwrite.projectId}${version ? `&v=${encodeURIComponent(version)}` : ''}` : null;

/** True when Appwrite answered "not found". */
export const isNotFound = (e: unknown) => (e as { code?: number })?.code === 404;
