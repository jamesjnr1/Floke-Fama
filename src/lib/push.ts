import 'server-only';
import { createHash } from 'node:crypto';
import { Query, type Models } from 'node-appwrite';
import webpush, { type PushSubscription } from 'web-push';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import type { SessionUser } from '@/lib/auth/session';
import type { Notification, ServiceState } from '@/lib/service/desk';

/**
 * Alerts on phones and computers (Web Push), so engineers hear about a new request even when the portal isn't
 * open, and hospitals when an engineer is on the way. Each device that turns alerts on is saved in Appwrite
 * (table `push_subscriptions`, one row per device). Needs NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
 * (see .env.example); without them, or without Appwrite, alerts are simply off.
 */
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
export const pushEnabled = Boolean(appwrite && publicKey && privateKey);
if (pushEnabled) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:support@flokefama.com', publicKey!, privateKey!);

type SubRow = Models.Row & { account: string; role: string; facility: string; data: string };
/** One row per device: the id is derived from the device's push address. */
const rowIdFor = (endpoint: string) => createHash('sha256').update(endpoint).digest('hex').slice(0, 32);

export async function saveSubscription(s: SessionUser, sub: PushSubscription) {
  const row = { account: s.email.toLowerCase(), role: s.role, facility: s.role === 'client' ? s.facility ?? s.name : '', data: JSON.stringify(sub) };
  await appwrite!.tables.upsertRow({ databaseId: DATABASE_ID, tableId: TABLES.pushSubscriptions, rowId: rowIdFor(sub.endpoint), data: row });
}

export async function removeSubscription(endpoint: string) {
  try {
    await appwrite!.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.pushSubscriptions, rowId: rowIdFor(endpoint) });
  } catch (e) {
    if (!isNotFound(e)) throw e;
  }
}

/** The devices to alert: every engineer's, or one hospital's. */
async function devices(role: 'engineer' | 'client', facility?: string) {
  const { rows } = await appwrite!.tables.listRows<SubRow>({
    databaseId: DATABASE_ID,
    tableId: TABLES.pushSubscriptions,
    queries: [Query.equal('role', role), ...(facility ? [Query.equal('facility', facility)] : []), Query.limit(500)],
  });
  return rows;
}

/** Where tapping the alert goes. */
const linkFor = (n: Notification) => {
  const home = n.audience === 'engineer' ? '/engineer' : '/portal';
  return n.ticketId ? `${home}?ticket=${encodeURIComponent(n.ticketId)}` : n.assetId ? `${home}?asset=${encodeURIComponent(n.assetId)}` : home;
};

/**
 * Sends an alert for each notification an action created (those in `after` but not in `before`). Devices that
 * have been switched off or uninstalled are removed. Never throws: an alert that can't be sent doesn't undo
 * the change it is about.
 */
export async function pushNew(before: ServiceState, after: ServiceState) {
  if (!pushEnabled) return;
  const old = new Set(before.notifications.map((n) => n.id));
  const fresh = after.notifications.filter((n) => !old.has(n.id));
  if (!fresh.length) return;
  const facilityOf = (n: Notification) => {
    const assetId = n.assetId ?? after.tickets.find((t) => t.id === n.ticketId)?.assetId;
    return after.assets.find((a) => a.id === assetId)?.facility;
  };
  const sends: Promise<unknown>[] = [];
  try {
    for (const n of fresh) {
      const facility = n.audience === 'client' ? facilityOf(n) : undefined;
      if (n.audience === 'client' && !facility) continue;
      const payload = JSON.stringify({
        title: n.audience === 'engineer' ? 'Flokefama Service' : 'Flokefama Care',
        body: n.text,
        url: linkFor(n),
        tag: n.ticketId ?? n.assetId ?? n.id,
      });
      for (const d of await devices(n.audience, facility)) {
        sends.push(
          webpush.sendNotification(JSON.parse(d.data) as PushSubscription, payload, { TTL: 60 * 60 * 24, urgency: 'high' }).catch((e: { statusCode?: number }) => {
            if (e.statusCode === 404 || e.statusCode === 410) return removeSubscription((JSON.parse(d.data) as PushSubscription).endpoint);
          }),
        );
      }
    }
    // Don't hold the response for long: a slow push service only delays its own alert
    await Promise.race([Promise.allSettled(sends), new Promise((r) => setTimeout(r, 4000))]);
  } catch (e) {
    console.error('push: alerts not sent', e);
  }
}
