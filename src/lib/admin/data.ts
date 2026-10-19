import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { roleFor } from '@/lib/auth/users';
import type { SavedOrder } from '@/lib/orders';
import { loadDesk } from '@/lib/service/server';
import type { ServiceState } from '@/lib/service/desk';
import { sampleData } from '@/lib/admin/sample';

/**
 * Everything the admin console shows, read on the server from Appwrite. Passwords (salt, hash) are never read.
 * Each table loads on its own, so one missing table shows as a problem on the System tab instead of breaking the page.
 */
export interface AdminAccount { id: string; name: string; email: string; organisation: string; phone: string; role: string; createdAt: string }
export interface AdminOrder extends SavedOrder { createdAt: string }
export interface TableStatus { table: string; label: string; ok: boolean; rows?: number; error?: string }

export interface AdminData {
  /** 'live': Appwrite; 'sample': made-up rows for a local preview; 'off': Appwrite not configured. */
  source: 'live' | 'sample' | 'off';
  accounts: AdminAccount[];
  orders: AdminOrder[];
  desk: Pick<ServiceState, 'assets' | 'tickets' | 'notifications'>;
  pushSubscriptions: number;
  tables: TableStatus[];
}

type Row = Models.Row & Record<string, unknown>;

async function listAll(tableId: string, queries: string[] = []) {
  const rows: Row[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 40; i++) {
    const page = await appwrite!.tables.listRows<Row>({ databaseId: DATABASE_ID, tableId, queries: [...queries, Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
    rows.push(...page.rows);
    if (page.rows.length < 500) break;
    cursor = page.rows[page.rows.length - 1].$id;
  }
  return rows;
}

const errorText = (e: unknown) => (e as Error)?.message?.slice(0, 200) || 'Unknown error';

export async function loadAdminData(): Promise<AdminData> {
  if (!appwrite) {
    const sample = process.env.ADMIN_SAMPLE_DATA === 'true' && process.env.VERCEL_ENV !== 'production';
    return sample ? sampleData() : { source: 'off', accounts: [], orders: [], desk: { assets: [], tickets: [], notifications: [] }, pushSubscriptions: 0, tables: [] };
  }

  const tables: TableStatus[] = [];
  const track = async <T>(table: string, label: string, work: () => Promise<T[]>, fallback: T[] = []) => {
    try {
      const rows = await work();
      tables.push({ table, label, ok: true, rows: rows.length });
      return rows;
    } catch (e) {
      tables.push({ table, label, ok: false, error: errorText(e) });
      return fallback;
    }
  };

  const [accounts, orders, push, desk] = await Promise.all([
    track(TABLES.accounts, 'Accounts', async () =>
      (await listAll(TABLES.accounts, [Query.select(['$id', '$createdAt', 'name', 'email', 'organisation', 'phone'])])).map((r) => ({
        id: r.$id,
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        organisation: String(r.organisation ?? ''),
        phone: String(r.phone ?? ''),
        role: roleFor(String(r.email ?? '')),
        createdAt: r.$createdAt,
      })),
    ),
    track(TABLES.orders, 'Orders', async () =>
      (await listAll(TABLES.orders)).flatMap((r) => {
        try {
          return [{ ...(JSON.parse(String(r.data)) as SavedOrder), createdAt: r.$createdAt }];
        } catch {
          return [];
        }
      }),
    ),
    track(TABLES.pushSubscriptions, 'Push subscriptions', () => listAll(TABLES.pushSubscriptions, [Query.select(['$id'])])),
    loadDesk().then(
      (d) => {
        tables.push({ table: 'service_*', label: 'Service desk (equipment, requests, notifications)', ok: true, rows: d.assets.length + d.tickets.length + d.notifications.length });
        return d;
      },
      (e) => {
        tables.push({ table: 'service_*', label: 'Service desk (equipment, requests, notifications)', ok: false, error: errorText(e) });
        return { assets: [], tickets: [], notifications: [] };
      },
    ),
  ]);

  return {
    source: 'live',
    accounts: accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    orders: orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    desk: { assets: desk.assets, tickets: desk.tickets, notifications: desk.notifications },
    pushSubscriptions: push.length,
    tables,
  };
}

/** Settings the site depends on, without ever showing a secret's value. */
export function configChecks() {
  const set = (v: string | undefined) => Boolean(v?.trim());
  const count = (v: string | undefined) => (v ?? '').split(',').map((s) => s.trim()).filter(Boolean).length;
  return [
    { label: 'Database (Appwrite)', ok: Boolean(appwrite), detail: appwrite ? `Project ${appwrite.projectId}` : 'APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY not set: accounts fall back to a browser cookie and orders stay in the browser.' },
    { label: 'Session secret', ok: set(process.env.SESSION_SECRET), detail: set(process.env.SESSION_SECRET) ? 'SESSION_SECRET is set.' : 'Set SESSION_SECRET (openssl rand -base64 48) so sign-ins are signed with your own key.' },
    { label: 'Admins', ok: count(process.env.ADMIN_EMAILS) > 0, detail: `${count(process.env.ADMIN_EMAILS)} email(s) in ADMIN_EMAILS.` },
    { label: 'Engineers', ok: count(process.env.ENGINEER_EMAILS) > 0, detail: `${count(process.env.ENGINEER_EMAILS)} email(s) in ENGINEER_EMAILS.` },
    { label: 'Content (Sanity)', ok: set(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID), detail: set(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) ? `Project ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}` : 'The site shows its built-in content.' },
    { label: 'Content webhook', ok: set(process.env.SANITY_REVALIDATE_SECRET), detail: set(process.env.SANITY_REVALIDATE_SECRET) ? 'Studio changes go live straight away.' : 'SANITY_REVALIDATE_SECRET not set: Studio changes appear within the cache time.' },
    { label: 'Quotes & messages (HubSpot)', ok: set(process.env.HUBSPOT_PORTAL_ID) && set(process.env.HUBSPOT_FORM_GUID), detail: 'Quote, demo and support requests are delivered to HubSpot; view them there.' },
    { label: 'Online payments', ok: set(process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER), detail: set(process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER) ? `Provider: ${process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER}` : 'No payment provider: orders are placed as "awaiting payment".' },
    { label: 'Push notifications', ok: set(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) && set(process.env.VAPID_PRIVATE_KEY), detail: 'Alerts to engineers and hospitals on their phones.' },
    { label: 'Search engines', ok: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true', detail: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? 'The site can be indexed by Google.' : 'NEXT_PUBLIC_ALLOW_INDEXING is not "true": every page is noindex (pre-launch).' },
  ];
}
