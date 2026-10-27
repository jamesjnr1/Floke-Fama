import 'server-only';
import { ID, Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, isNotFound, TABLES } from '@/lib/appwrite';
import { isTableMissing, withTable } from '@/lib/appwrite-tables';
import { roleFor } from '@/lib/auth/users';
import type { Actor, Priority, ServiceState, Ticket } from '@/lib/service/desk';
import { getSite } from '@/lib/site';
import { registeredFacilities } from '@/lib/service/facilities';
import { siteUrl } from '@/lib/utils';

/**
 * Text messages (SMS) to engineers, so they hear about urgent faults even without data or the portal open.
 * Only things an engineer must act on are texted: an urgent new request (all engineers), a job given to them by
 * someone else, a hospital's message on their job, and, if an urgent request is still untaken after
 * SMS_ESCALATE_MINUTES, the admins and SMS_ESCALATION_NUMBERS. Texts never carry the fault description, only
 * the hospital, the equipment, the job number and a link (which needs a sign-in).
 *
 * SMS_PROVIDER picks the gateway: empty = off; "log" = nothing is sent, each text is only recorded (for demos);
 * "arkesel" or "mnotify" (SMS_API_KEY); "hubtel" (SMS_CLIENT_ID, SMS_CLIENT_SECRET). Every text is recorded in
 * Appwrite (table `sms_log`) and listed in the admin console. Needs Appwrite: the shared service desk lives there.
 */
const provider = (process.env.SMS_PROVIDER ?? '').trim().toLowerCase();
const PROVIDERS = ['log', 'arkesel', 'mnotify', 'hubtel'];
export const smsProvider = PROVIDERS.includes(provider) ? provider : '';
export const smsEnabled = Boolean(appwrite && smsProvider);
/** The sender ID exactly as approved with the gateway (letters' case included): Flokefama's own is "Flokefama". */
const sender = (process.env.SMS_SENDER_ID?.trim() || 'Flokefama').slice(0, 11);
/** Arkesel's address; SMS_API_URL only to point tests at a stand-in. */
const arkesel = () => (process.env.SMS_API_URL?.trim() || 'https://sms.arkesel.com').replace(/\/$/, '');
const urgent = new Set((process.env.SMS_URGENT_PRIORITIES ?? 'critical,high').split(',').map((p) => p.trim()).filter(Boolean));
export const escalateMinutes = Math.max(0, Number(process.env.SMS_ESCALATE_MINUTES ?? 30) || 0);

export interface SmsLogEntry { id: string; at: string; kind: string; ref: string; to: string; text: string; status: 'sent' | 'logged' | 'failed' | 'sending'; detail: string }

/** Ghana numbers in the international form gateways expect: 0241234567 or +233 24 123 4567 → 233241234567. */
export function normalisePhone(raw: string) {
  const d = (raw ?? '').replace(/\D/g, '');
  const n = d.startsWith('00') ? d.slice(2) : d.length === 10 && d.startsWith('0') ? `233${d.slice(1)}` : d;
  return /^\d{11,15}$/.test(n) ? n : null;
}

/** Plain characters only, so one text stays one text (curly quotes and dashes switch phones to a 70-character limit). */
export const plain = (s: string, max: number) => {
  const t = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '').trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}.` : t;
};

/* ---------- sending ---------- */

async function deliver(to: string[], text: string): Promise<{ status: SmsLogEntry['status']; detail: string }> {
  if (smsProvider === 'log') return { status: 'logged', detail: 'SMS_PROVIDER=log: recorded, not sent' };
  const json = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) });
  const read = async (res: Response) => ({ ok: res.ok, body: (await res.json().catch(() => ({}))) as { status?: string; message?: string } });
  if (smsProvider === 'arkesel') {
    const key = process.env.SMS_API_KEY ?? '';
    const r = await read(await fetch(`${arkesel()}/api/v2/sms/send`, { ...json({ sender, message: text, recipients: to }), headers: { 'Content-Type': 'application/json', 'api-key': key } }));
    return r.ok && r.body.status === 'success' ? { status: 'sent', detail: 'Arkesel' } : { status: 'failed', detail: `Arkesel: ${r.body.message ?? 'not accepted'}` };
  }
  if (smsProvider === 'mnotify') {
    const key = encodeURIComponent(process.env.SMS_API_KEY ?? '');
    const r = await read(await fetch(`https://api.mnotify.com/api/sms/quick?key=${key}`, json({ recipient: to, sender, message: text, is_schedule: false, schedule_date: '' })));
    return r.ok && r.body.status === 'success' ? { status: 'sent', detail: 'mNotify' } : { status: 'failed', detail: `mNotify: ${r.body.message ?? 'not accepted'}` };
  }
  // Hubtel takes one number per request
  const auth = Buffer.from(`${process.env.SMS_CLIENT_ID ?? ''}:${process.env.SMS_CLIENT_SECRET ?? ''}`).toString('base64');
  const results = await Promise.all(
    to.map(async (n) => {
      const res = await fetch('https://smsc.hubtel.com/v1/messages/send', { ...json({ From: sender, To: n, Content: text }), headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` } });
      return res.ok;
    }),
  );
  const failed = results.filter((ok) => !ok).length;
  return failed ? { status: 'failed', detail: `Hubtel: ${failed} of ${to.length} not accepted` } : { status: 'sent', detail: 'Hubtel' };
}

type LogRow = Models.Row & Omit<SmsLogEntry, 'id' | 'at'>;
const write = (rowId: string, data: Omit<SmsLogEntry, 'id' | 'at'>, create: boolean) =>
  withTable(TABLES.smsLog, () =>
    create
      ? appwrite!.tables.createRow({ databaseId: DATABASE_ID, tableId: TABLES.smsLog, rowId, data })
      : appwrite!.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.smsLog, rowId, data }),
  );
/** Records a text. A sms_log table made before greetings got longer keeps 320 characters, so a long one is shortened there. */
const save = (rowId: string, data: Omit<SmsLogEntry, 'id' | 'at'>, create = true) =>
  write(rowId, data, create).catch((e) => {
    if ((e as { code?: number }).code !== 400 || data.text.length <= 320) throw e;
    return write(rowId, { ...data, text: `${data.text.slice(0, 317)}...` }, create);
  });

/**
 * Sends one text to some numbers and records it. With `rowId` given, the record is written first and a second
 * attempt with the same id is skipped, so an escalation goes out once even if two servers notice it together.
 */
export async function send(kind: string, ref: string, phones: string[], text: string, rowId?: string, max = 300): Promise<{ status: SmsLogEntry['status']; detail: string } | undefined> {
  const to = [...new Set(phones.map(normalisePhone).filter((n): n is string => Boolean(n)))];
  if (!to.length) return;
  const body = plain(text, max);
  const record = { kind, ref, to: to.join(',').slice(0, 400), text: body };
  const id = rowId ?? ID.unique();
  if (rowId) {
    try {
      await save(id, { ...record, status: 'sending', detail: '' });
    } catch (e) {
      if ((e as { code?: number }).code === 409) return; // already sent
      throw e;
    }
  }
  const result = await deliver(to, body).catch((e: Error) => ({ status: 'failed' as const, detail: plain(e.message || 'Gateway not reachable', 180) }));
  await save(id, { ...record, ...result, detail: plain(result.detail, 190) }, !rowId);
  if (result.status === 'failed') console.error(`sms: ${kind} ${ref} not sent:`, result.detail);
  return result;
}

/** The admin console's "Send a test text": one text to the number given, recorded like the rest. */
export async function sendTestSms(phone: string, by: string): Promise<{ ok: boolean; detail: string }> {
  if (!smsEnabled) return { ok: false, detail: 'Texts are off: set SMS_PROVIDER (and the gateway keys) in Vercel, then redeploy.' };
  if (!normalisePhone(phone)) return { ok: false, detail: 'Enter a Ghana phone number, e.g. 024 123 4567.' };
  const r = await send('test', 'TEST', [phone], `Test text from the Flokefama website, sent by ${plain(by, 40)}. Texts to engineers are working.`);
  if (!r) return { ok: false, detail: 'That number could not be used.' };
  if (r.status === 'logged') return { ok: true, detail: 'Recorded but not sent: SMS_PROVIDER is "log". Set it to "arkesel" to send real texts.' };
  return r.status === 'sent' ? { ok: true, detail: `Sent from "${sender}". It should arrive within a minute.` } : { ok: false, detail: r.detail };
}

/**
 * A live check for the admin console (nothing is sent): for Arkesel, whether the key is accepted and the SMS balance.
 * Null for the other providers, which keep their settings check.
 */
export async function smsStatus(): Promise<{ ok: boolean; detail: string } | null> {
  if (smsProvider !== 'arkesel') return null;
  const key = process.env.SMS_API_KEY?.trim();
  if (!key) return { ok: false, detail: 'SMS_PROVIDER is "arkesel" but SMS_API_KEY is not set (Arkesel → Dashboard → API keys). Add it in Vercel, then redeploy.' };
  try {
    const res = await fetch(`${arkesel()}/api/v2/clients/balance-details`, { headers: { Accept: 'application/json', 'api-key': key }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const body = (await res.json().catch(() => ({}))) as { status?: string; message?: string; data?: { sms_balance?: string | number; main_balance?: string | number } };
    if (!res.ok || body.status !== 'success') return { ok: false, detail: `Arkesel did not accept SMS_API_KEY: ${body.message ?? `error ${res.status}`}. Copy the API key again from Arkesel (Dashboard → API keys).` };
    const balance = body.data?.sms_balance;
    const low = balance !== undefined && Number(String(balance).replace(/[^\d.]/g, '')) < 20;
    return {
      ok: !low,
      detail: `Connected to Arkesel, sending from "${sender}"${balance !== undefined ? `. SMS balance: ${balance}` : ''}${low ? ' (low: top up in Arkesel so texts keep going out)' : ''}. Send a test text below to check the sender ID is approved.`,
    };
  } catch {
    return { ok: false, detail: 'Arkesel could not be reached from this server. Try again in a minute.' };
  }
}

/* ---------- who ---------- */

interface Person { name: string; phone: string; role: string }
async function staff(): Promise<Person[]> {
  const rows: (Models.Row & { name: string; email: string; phone: string })[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const page = await appwrite!.tables.listRows<Models.Row & { name: string; email: string; phone: string }>({
      databaseId: DATABASE_ID,
      tableId: TABLES.accounts,
      queries: [Query.select(['$id', 'name', 'email', 'phone']), Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    rows.push(...page.rows);
    if (page.rows.length < 500) break;
    cursor = page.rows[page.rows.length - 1].$id;
  }
  return rows.map((r) => ({ name: r.name, phone: r.phone ?? '', role: roleFor(r.email ?? '', r.$id) })).filter((p) => p.role !== 'client' && p.phone);
}

/* ---------- what ---------- */

const where = (t: Ticket, s: ServiceState) => {
  const a = s.assets.find((x) => x.id === t.assetId);
  return { facility: plain(a?.facility ?? 'a hospital', 40), equipment: plain(a?.name ?? t.title.split(':')[0], 40) };
};
const jobLink = (id: string) => `${siteUrl}/engineer?ticket=${encodeURIComponent(id)}`;
const isUrgent = (p: Priority) => urgent.has(p);

/**
 * Texts for what an action just changed (compare `before` and `after`). Never throws and never holds the
 * response for long: a text that can't go out doesn't undo the change it is about.
 */
export async function smsNew(before: ServiceState, after: ServiceState, actor: Actor) {
  if (!smsEnabled) return;
  try {
    const old = new Map(before.tickets.map((t) => [t.id, t]));
    const jobs: { kind: string; ref: string; to: (p: Person) => boolean; text: string }[] = [];
    for (const t of after.tickets) {
      const prev = old.get(t.id);
      const { facility, equipment } = where(t, after);
      if (!prev && t.status === 'new' && isUrgent(t.priority))
        jobs.push({ kind: 'urgent', ref: t.id, to: (p) => p.role === 'engineer' && p.name !== actor.name, text: `${t.priority.toUpperCase()} fault at ${facility} - ${equipment}. Job ${t.id} needs an engineer. Open: ${jobLink(t.id)}` });
      if (t.engineer && t.engineer !== prev?.engineer && t.engineer !== actor.name)
        jobs.push({ kind: 'assigned', ref: t.id, to: (p) => p.role === 'engineer' && p.name === t.engineer, text: `Job ${t.id} at ${facility} - ${equipment} is now yours (${t.priority}). Open: ${jobLink(t.id)}` });
      const note = prev && t.engineer && t.status !== 'resolved' && actor.role === 'client' && t.log.length > prev.log.length && t.log.at(-1)?.kind === 'note';
      if (note) jobs.push({ kind: 'message', ref: t.id, to: (p) => p.role === 'engineer' && p.name === t.engineer, text: `New message from ${facility} on job ${t.id} (${equipment}). Open: ${jobLink(t.id)}` });
    }
    const updates = await hospitalUpdates(before, after);
    if (!jobs.length && !updates.length) return;
    const people = jobs.length ? await staff() : [];
    const sends = [
      ...jobs.map((j) => send(j.kind, j.ref, people.filter(j.to).map((p) => p.phone), j.text).catch((e) => console.error('sms: not recorded', e))),
      ...updates.map((u) => send('update', u.ref, [u.phone], u.text).catch((e) => console.error('sms: update not recorded', e))),
    ];
    await Promise.race([Promise.allSettled(sends), new Promise((r) => setTimeout(r, 6000))]);
  } catch (e) {
    console.error('sms: texts not sent', e);
  }
}

/**
 * Updates to the hospital on its own request, at the number it gave for them (the request's contact number). Only
 * the two that matter, to keep texts few: an engineer is assigned (with the engineer's number), and it is fixed.
 * On the way and on site show in the portal.
 */
async function hospitalUpdates(before: ServiceState, after: ServiceState) {
  const old = new Map(before.tickets.map((t) => [t.id, t]));
  const out: { ref: string; phone: string; text: string }[] = [];
  let office = '';
  let registered: Set<string> | undefined;
  for (const t of after.tickets) {
    const prev = old.get(t.id);
    if (!t.contactPhone || !normalisePhone(t.contactPhone) || (prev && prev.status === t.status)) continue;
    const { equipment } = where(t, after);
    const eng = plain(t.engineer ?? 'Our engineer', 30);
    const engPhone = t.engineerPhone ? ` on ${plain(t.engineerPhone, 20)}` : '';
    let text = '';
    if (t.status === 'assigned') text = `Request ${t.id} (${equipment}): engineer ${eng} is assigned. You can reach ${eng.split(' ')[0]}${engPhone || ' through your portal'}.`;
    else if (t.status === 'resolved') {
      office ||= (await getSite()).contact.phone;
      registered ??= new Set(await registeredFacilities().catch(() => []));
      const facility = after.assets.find((a) => a.id === t.assetId)?.facility ?? '';
      // A hospital without an account (a Support page caller) has no portal to rate in: invite it to register instead
      text = registered.has(facility)
        ? `Request ${t.id}: your ${equipment} is fixed. Please rate the visit in your Flokefama portal. If anything is not right, call ${office}.`
        : `Request ${t.id}: your ${equipment} is fixed. If anything is not right, call ${office}. To follow future visits online, register free at ${siteUrl.replace(/^https?:\/\//, '')}/login.`;
    }
    if (text) out.push({ ref: t.id, phone: t.contactPhone, text });
  }
  return out;
}

/**
 * A fault reported with the Support page's form (by anyone, not only portal clients): every engineer is texted
 * with who to call back. Other request types (maintenance, installation, other) wait for the support team.
 */
export async function smsWebsiteFault(r: { reference: string; type: string; name: string; facility: string; phone: string; equipment: string; working?: string }) {
  if (!smsEnabled || r.type !== 'fault') return;
  try {
    const people = (await staff()).filter((p) => p.role === 'engineer');
    const down = r.working === 'down' ? ' NOT WORKING AT ALL.' : '';
    const text = `Fault reported on the website by ${plain(r.facility, 40)} - ${plain(r.equipment, 40)}.${down} Call ${plain(r.name, 30)} on ${plain(r.phone, 20)}. Ref ${r.reference}.`;
    await Promise.race([send('website', r.reference, people.map((p) => p.phone), text), new Promise((ok) => setTimeout(ok, 6000))]);
  } catch (e) {
    console.error('sms: website fault not texted', e);
  }
}

let lastCheck = 0;
/**
 * Urgent requests nobody has taken after SMS_ESCALATE_MINUTES: the admins (with a phone on their account) and
 * SMS_ESCALATION_NUMBERS get one text each. Requests older than a day are left alone, so switching texts on
 * doesn't send a burst about old ones. Runs at most once a minute per server unless `force` (the scheduled check).
 */
export async function escalateStale(desk: ServiceState, force = false) {
  if (!smsEnabled || !escalateMinutes) return 0;
  const now = Date.now();
  if (!force && now - lastCheck < 60_000) return 0;
  lastCheck = now;
  try {
    const due = desk.tickets.filter((t) => {
      const age = now - new Date(t.openedAt).getTime();
      return t.status === 'new' && isUrgent(t.priority) && age >= escalateMinutes * 60_000 && age < 864e5;
    });
    if (!due.length) return 0;
    const rowId = (t: Ticket) => `esc-${t.id}`.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 36);
    const { rows } = await appwrite!.tables
      .listRows<LogRow>({ databaseId: DATABASE_ID, tableId: TABLES.smsLog, queries: [Query.equal('$id', due.map(rowId)), Query.select(['$id']), Query.limit(100)] })
      .catch((e) => (isTableMissing(e) ? { rows: [] as LogRow[] } : Promise.reject(e)));
    const done = new Set(rows.map((r) => r.$id));
    const todo = due.filter((t) => !done.has(rowId(t)));
    if (!todo.length) return 0;
    const extra = (process.env.SMS_ESCALATION_NUMBERS ?? '').split(',');
    const admins = (await staff()).filter((p) => p.role === 'admin').map((p) => p.phone);
    await Promise.all(
      todo.map((t) => {
        const { facility, equipment } = where(t, desk);
        const mins = Math.round((now - new Date(t.openedAt).getTime()) / 60_000);
        return send('escalation', t.id, [...admins, ...extra], `No engineer has taken ${t.priority.toUpperCase()} job ${t.id} at ${facility} - ${equipment} after ${mins} min. Open: ${siteUrl}/admin?tab=service`, rowId(t)).catch((e) =>
          console.error('sms: escalation not recorded', e),
        );
      }),
    );
    return todo.length;
  } catch (e) {
    console.error('sms: escalation check failed', e);
    return 0;
  }
}

/** The latest texts, newest first, for the admin console. */
export async function recentSms(limit = 25): Promise<SmsLogEntry[]> {
  try {
    const { rows } = await appwrite!.tables.listRows<LogRow>({ databaseId: DATABASE_ID, tableId: TABLES.smsLog, queries: [Query.orderDesc('$createdAt'), Query.limit(limit)] });
    return rows.map((r) => ({ id: r.$id, at: r.$createdAt, kind: r.kind, ref: r.ref, to: r.to, text: r.text, status: r.status, detail: r.detail ?? '' }));
  } catch (e) {
    if (!isNotFound(e) && !isTableMissing(e)) console.error('sms: log not readable', e);
    return [];
  }
}
