import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { roleFor } from '@/lib/auth/users';
import type { SavedOrder } from '@/lib/orders';
import { loadDesk } from '@/lib/service/server';
import type { ServiceState } from '@/lib/service/desk';
import { sampleData } from '@/lib/admin/sample';
import { accountPictures } from '@/lib/account-photos';
import { isTableMissing } from '@/lib/appwrite-tables';
import { listSupportRequests, type SupportRequest } from '@/lib/support-requests';
import { escalateMinutes, recentSms, smsEnabled, smsProvider, type SmsLogEntry } from '@/lib/sms';

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
  /** The latest text messages (SMS) sent to engineers and admins. */
  sms: SmsLogEntry[];
  /** Requests from the Support page's form, newest first. */
  supportRequests: SupportRequest[];
  /** Each account's picture by account id: an engineer's photo or a hospital's logo. */
  pictures: Record<string, string>;
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
    return sample ? sampleData() : { source: 'off', accounts: [], orders: [], desk: { assets: [], tickets: [], notifications: [] }, pushSubscriptions: 0, sms: [], supportRequests: [], pictures: {}, tables: [] };
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

  const [accounts, orders, push, desk, sms, supportRequests, pictures] = await Promise.all([
    track(TABLES.accounts, 'Accounts', async () =>
      (await listAll(TABLES.accounts, [Query.select(['$id', '$createdAt', 'name', 'email', 'organisation', 'phone'])])).map((r) => ({
        id: r.$id,
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        organisation: String(r.organisation ?? ''),
        phone: String(r.phone ?? ''),
        role: roleFor(String(r.email ?? ''), r.$id),
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
    smsEnabled ? recentSms(200) : Promise.resolve([]),
    // Created by the site on the first request, so until then there is simply nothing to list
    track(TABLES.supportRequests, 'Support requests (website form)', () => listSupportRequests().catch((e) => (isTableMissing(e) ? [] : Promise.reject(e)))),
    accountPictures().catch(() => ({}) as Record<string, string>),
  ]);

  return {
    source: 'live',
    accounts: accounts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    orders: orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    desk: { assets: desk.assets, tickets: desk.tickets, notifications: desk.notifications },
    pushSubscriptions: push.length,
    sms,
    supportRequests,
    pictures,
    tables,
  };
}

/** Phone alerts: both keys set, and each the right kind (a public key of 65 bytes starting 04, a private key of 32 bytes). */
function pushCheck() {
  const label = 'Phone alerts (Web Push)';
  const pub = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '').trim();
  const priv = (process.env.VAPID_PRIVATE_KEY ?? '').trim();
  if (!pub || !priv) return { label, ok: false, detail: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY not set: phone alerts are off. Create them with npx web-push generate-vapid-keys.' };
  const bytes = (v: string) => Buffer.from(v.replace(/^["']|["']$/g, ''), 'base64url');
  const p = bytes(pub);
  const k = bytes(priv);
  if (p.length !== 65 || p[0] !== 4) return { label, ok: false, detail: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY isn’t a valid public key (check for a missing character, spaces or quotes; the public key is the longer one). Redeploy after fixing it.' };
  if (k.length !== 32) return { label, ok: false, detail: 'VAPID_PRIVATE_KEY isn’t a valid private key (it is the shorter key of the pair).' };
  return { label, ok: true, detail: 'Alerts to engineers and hospitals on their phones. If a device can’t turn them on, the message on that device says why.' };
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
    { label: 'Online payments', ok: set(process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER), detail: set(process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER) ? `Provider: ${process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER}` : 'No payment provider: orders are placed as "awaiting payment".' },
    pushCheck(),
    {
      label: 'Text messages (SMS)',
      ok: smsEnabled,
      detail: !smsProvider
        ? 'SMS_PROVIDER not set: engineers get no texts. Use "log" to try it without sending, or arkesel, mnotify or hubtel with the gateway’s keys.'
        : smsProvider === 'log'
          ? 'SMS_PROVIDER=log: texts are recorded on the Service tab but not sent.'
          : `Sent through ${smsProvider}. Unanswered urgent requests ${escalateMinutes ? `are escalated after ${escalateMinutes} minutes` : 'are not escalated (SMS_ESCALATE_MINUTES=0)'}${set(process.env.CRON_SECRET) ? '' : '; set CRON_SECRET and schedule /api/cron/sms so escalations go out when no portal is open'}.`,
    },
    { label: 'Search engines', ok: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true', detail: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' ? 'The site can be indexed by Google.' : 'NEXT_PUBLIC_ALLOW_INDEXING is not "true": every page is noindex (pre-launch).' },
  ];
}
