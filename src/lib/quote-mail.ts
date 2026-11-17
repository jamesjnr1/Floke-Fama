import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { withTable } from '@/lib/appwrite-tables';
import { tidyName } from '@/lib/installation';
import { departmentLabel, timelineLabel } from '@/lib/order-needs';
import type { SavedOrder } from '@/lib/orders';
import { textQuote } from '@/lib/sms';
import { emailSales, supportEmailConfigured } from '@/lib/support-email';
import { siteUrl } from '@/lib/utils';

/**
 * Every quote request reaches Flokefama by itself: an email to info@flokefama.com and a text to the company line,
 * the moment it is sent, with nobody needing to open the admin console. A quote that couldn't be sent then (email
 * down, or sent before this was in place) is sent by the catch-up below, which runs while people use the site and in
 * the daily job. Each quote is sent once: a claim row (in `rate_limits`, id qs_<reference>) is written first, so two
 * servers never send the same one, and the order is marked with when it went.
 */
const CATCH_UP_DAYS = 14;
type OrderRow = Models.Row & { data: string };
export type Who = { name: string; facility: string; phone: string; email: string };

const claimId = (reference: string) => `qs_${reference.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

/** True when this server may send the quote (nobody has yet). */
async function claim(reference: string) {
  if (!appwrite) return true;
  try {
    await withTable(TABLES.rateLimits, () => appwrite!.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.rateLimits, rowId: claimId(reference), data: { hits: `quote ${new Date().toISOString()}` } }));
    return true;
  } catch (e) {
    if ((e as { code?: number }).code === 409) return false;
    throw e;
  }
}
/** Lets the quote be tried again later (the email didn't go). */
const release = (reference: string) => appwrite?.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.rateLimits, rowId: claimId(reference) }).catch(() => {});

async function markSent(reference: string, at: string) {
  if (!appwrite) return;
  try {
    const row = (await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference })) as OrderRow;
    const o = JSON.parse(String(row.data)) as SavedOrder;
    await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference, data: { data: JSON.stringify({ ...o, supportSentAt: at }) } });
  } catch (e) {
    console.error('[quotes] not marked as sent', reference, e);
  }
}

/** Emails the quote to info@flokefama.com and texts the company line. True when the email went. Never throws. */
export async function deliverQuote(o: SavedOrder, who: Who, opts: { late?: boolean; onBoard?: boolean; payment?: string } = {}) {
  try {
    if (!(await claim(o.reference))) return true; // already sent by another server
  } catch (e) {
    console.error('[quotes] claim not written, sending anyway', o.reference, e);
  }
  const lines = o.items.map((i) => ({ name: tidyName(i.name), qty: i.qty }));
  const urgent = o.needs?.timeline === 'urgent';
  const department = departmentLabel(o.needs?.department);
  const count = lines.reduce((n, i) => n + i.qty, 0);
  const texted = textQuote({ reference: o.reference, facility: who.facility, name: who.name, phone: who.phone, items: lines, urgent });
  const emailed = await emailSales(
    `${urgent ? 'URGENT quote request' : 'New quote request'} ${o.reference}: ${who.facility} (${count} item${count === 1 ? '' : 's'})`,
    {
      Reference: o.reference,
      Items: lines.map((i) => `• ${i.name} × ${i.qty}`).join('\n'),
      ...(department ? { Department: department } : {}),
      Needed: timelineLabel(o.needs?.timeline) ?? '',
      ...(o.needs?.notes ? { Notes: o.needs.notes } : {}),
      ...(opts.payment ? { Payment: opts.payment } : {}),
      'Deliver to': [o.address, o.region].filter(Boolean).join(', '),
      Name: who.name,
      'Hospital or lab': who.facility,
      Phone: who.phone,
      Email: who.email,
      ...(opts.late ? { Sent: `${new Date(o.placedAt).toUTCString()} (forwarded now)` } : {}),
    },
    opts.onBoard === false ? { phone: who.phone, replyTo: who.email } : { phone: who.phone, replyTo: who.email, link: { href: `${siteUrl}/admin?tab=orders&order=${o.reference}`, label: 'Open it on the sales board' } },
  ).then((sent) => Boolean(sent), (e) => (console.error('[quotes] email to support not sent', o.reference, e), false));
  await texted;
  if (emailed) await markSent(o.reference, new Date().toISOString());
  else await release(o.reference);
  return emailed;
}

let lastRun = 0;
let running: Promise<number> | null = null;

/**
 * Sends every quote of the last 14 days that hasn't reached info@flokefama.com yet. Runs at most every 10 minutes
 * per server (or when `force`, from the daily job). Returns how many it sent.
 */
export function catchUpQuotes(force = false): Promise<number> {
  if (!appwrite || !supportEmailConfigured()) return Promise.resolve(0);
  if (running) return running;
  if (!force && Date.now() - lastRun < 10 * 60_000) return Promise.resolve(0);
  lastRun = Date.now();
  running = (async () => {
    let sent = 0;
    try {
      const since = new Date(Date.now() - CATCH_UP_DAYS * 864e5).toISOString();
      const { rows } = await appwrite!.tables.listRows<OrderRow>({ databaseId: DATABASE_ID, tableId: TABLES.orders, queries: [Query.greaterThan('$createdAt', since), Query.orderDesc('$createdAt'), Query.limit(100)] });
      for (const r of rows) {
        let o: SavedOrder & { supportSentAt?: string };
        try {
          o = JSON.parse(String(r.data));
        } catch {
          continue;
        }
        if (o.supportSentAt || o.method !== 'quote' || Date.parse(o.placedAt) < Date.parse(since)) continue;
        const who = { name: o.contact?.name ?? '', facility: o.contact?.organisation ?? o.account, phone: o.contact?.phone ?? '', email: o.account };
        if (await deliverQuote(o, who, { late: true })) sent++;
      }
    } catch (e) {
      console.error('[quotes] catch-up failed', e);
    } finally {
      running = null;
    }
    if (sent) console.log(`[quotes] ${sent} earlier quote request(s) sent to support`);
    return sent;
  })();
  return running;
}
