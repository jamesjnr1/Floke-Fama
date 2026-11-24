import 'server-only';
import { Client, Storage, TablesDB } from 'node-appwrite';
import { supabaseDb } from '@/lib/supabase-db';

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
  smsLog: 'sms_log',
  supportRequests: 'support_requests',
  smsOptOut: 'sms_optout',
  /** The hospital registry: one row per hospital, its id the hospital code (FLK-H001). */
  facilities: 'facilities',
  /** Shared limits (wrong passwords, sign-ups, forms): one row per key, the times of its recent attempts. */
  rateLimits: 'rate_limits',
  /** Site health: errors on the site and the portals, one row per kind of error (lib/monitor.ts). */
  siteErrors: 'site_errors',
  /** Site monitor (lib/pulse): one row per visit to the site, kept 30 days. */
  visits: 'visits',
  /** Site monitor: one row per day, that day's visits added up (kept for good). */
  visitDays: 'visit_days',
} as const;
export const BUCKETS = { hospitalLogos: 'hospital-logos' } as const;

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
const supabase = supabaseUrl && supabaseKey ? supabaseDb(supabaseUrl, supabaseKey) : null;

/** Which database the site uses: Supabase when it is set up (SUPABASE_URL and its secret key), otherwise Appwrite. */
export const databaseName = supabase ? 'Supabase' : 'Appwrite';

/**
 * The database. Supabase when SUPABASE_URL and SUPABASE_SECRET_KEY are set (lib/supabase-db.ts answers the same
 * calls as Appwrite, so nothing else in the site changes), otherwise Appwrite as before. Null when neither is set up.
 */
export const appwrite = supabase
  ? ({ tables: supabase.tables, storage: supabase.storage, endpoint: supabaseUrl!, projectId: new URL(supabaseUrl!).hostname.split('.')[0] } as unknown as { tables: TablesDB; storage: Storage; endpoint: string; projectId: string })
  : endpoint && projectId && apiKey
    ? (() => {
        const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
        return { tables: new TablesDB(client), storage: new Storage(client), endpoint, projectId };
      })()
    : null;

/** Public address of a stored file (the logos bucket can be read by anyone; only the server can write). */
export const fileUrl = (bucketId: string, fileId: string, version?: string) =>
  supabase
    ? supabase.fileUrl(bucketId, fileId, version)
    : appwrite
      ? `${appwrite.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${appwrite.projectId}${version ? `&v=${encodeURIComponent(version)}` : ''}`
      : null;

/** True when Appwrite answered "not found". */
export const isNotFound = (e: unknown) => (e as { code?: number })?.code === 404;
