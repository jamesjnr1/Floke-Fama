import 'server-only';
import { Query, type Models } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { isTableMissing, withTable } from '@/lib/appwrite-tables';
import { roleFor } from '@/lib/auth/users';
import type { ServiceState } from '@/lib/service/desk';
import { getProducts } from '@/lib/data';
import { getSite } from '@/lib/site';
import { normalisePhone, plain, send, smsEnabled } from '@/lib/sms';
import { siteUrl } from '@/lib/utils';

/**
 * Texts to hospitals, to keep in touch between visits. Automatic ones go out once a day (the daily check,
 * /api/cron/clients at 9:00 Ghana time):
 * - a check-in 7 days after a repair or installation is resolved ("we hope it is working well");
 * - a calibration reminder 14 days before a machine is due;
 * - greetings on New Year's Day, Independence Day, Easter Sunday and Christmas Day.
 * The admin console also sends to all hospitals at once (new arrivals, other holidays, news).
 * Each goes once (recorded in sms_log). Hospitals can turn them off in their portal (table sms_optout).
 * CLIENT_TEXTS=off stops the automatic ones; sending from the admin console still works.
 */
export const clientTextsAuto = smsEnabled && (process.env.CLIENT_TEXTS ?? 'on').trim().toLowerCase() !== 'off';
export const CHECK_IN_DAYS = 7;
export const CALIBRATION_NOTICE_DAYS = 14;
const DAY = 864e5;

type AccountRow = Models.Row & { name: string; email: string; organisation: string; phone: string };

/** Hospital accounts that can be texted: a valid phone number, and texts not turned off. */
export async function hospitalsToText() {
  if (!appwrite) return [];
  const [rows, off] = await Promise.all([listAccounts(), optedOut()]);
  return rows
    .filter((r) => roleFor(r.email ?? '', r.$id) === 'client' && normalisePhone(r.phone ?? '') && !off.has(r.$id))
    .map((r) => ({ id: r.$id, name: r.name, facility: r.organisation ?? '', phone: r.phone }));
}

async function listAccounts() {
  const rows: AccountRow[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const page = await appwrite!.tables.listRows<AccountRow>({
      databaseId: DATABASE_ID,
      tableId: TABLES.accounts,
      queries: [Query.select(['$id', 'name', 'email', 'organisation', 'phone']), Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
    });
    rows.push(...page.rows);
    if (page.rows.length < 500) break;
    cursor = page.rows[page.rows.length - 1].$id;
  }
  return rows;
}

/* ---------- turning texts off (the hospital's choice, in its portal) ---------- */

async function optedOut() {
  try {
    const { rows } = await appwrite!.tables.listRows({ databaseId: DATABASE_ID, tableId: TABLES.smsOptOut, queries: [Query.select(['$id']), Query.limit(5000)] });
    return new Set(rows.map((r) => r.$id));
  } catch (e) {
    if (isTableMissing(e)) return new Set<string>();
    throw e;
  }
}

/** Whether this hospital account gets Flokefama's texts (on unless they turned them off). */
export async function textsOn(accountId: string) {
  return !(await optedOut()).has(accountId);
}

export async function setTextsOn(accountId: string, on: boolean, email: string) {
  if (on) {
    await appwrite!.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.smsOptOut, rowId: accountId }).catch((e) => {
      if ((e as { code?: number }).code !== 404) throw e;
    });
  } else {
    await withTable(TABLES.smsOptOut, () =>
      appwrite!.tables.upsertRow({ databaseId: DATABASE_ID, tableId: TABLES.smsOptOut, rowId: accountId, data: { account: email.toLowerCase().slice(0, 254) } }),
    );
  }
}

/* ---------- the messages ---------- */

const fmtDay = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Accra' });

/** Easter Sunday (Gregorian), for the Easter greeting. */
export function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/** The holidays greeted automatically, with their text. */
export function holidays(year: number, phone: string) {
  const on = (m: number, d: number) => new Date(Date.UTC(year, m - 1, d));
  return [
    { key: 'newyear', name: 'New Year’s Day', date: on(1, 1), text: `Happy New Year from all of us at Flokefama! Thank you for trusting us with your equipment. We look forward to serving you in ${year}.` },
    { key: 'independence', name: 'Independence Day', date: on(3, 6), text: 'Happy Independence Day from Flokefama! We are proud to serve Ghana’s hospitals and laboratories. Thank you for working with us.' },
    { key: 'easter', name: 'Easter Sunday', date: easterSunday(year), text: 'Happy Easter from Flokefama. Wishing you and your team a peaceful and joyful Easter.' },
    { key: 'christmas', name: 'Christmas Day', date: on(12, 25), text: `Merry Christmas from all of us at Flokefama! Thank you for your trust this year. Our engineers remain on call: ${phone}.` },
  ];
}

export const checkInText = (machine: string, facility: string, visit: string, phone: string) =>
  `Hello ${facility}. We hope your ${machine} is working well since our visit on ${visit}. If anything is not right, call us on ${phone}.`;
export const calibrationText = (machine: string, facility: string, due: string, phone: string) =>
  `${facility}: your ${machine} is due for calibration on ${due}. Call ${phone} to book a visit, or request it in your Flokefama portal.`;

/** Ready-made messages for the admin console's "Send to hospitals" (the admin can edit them before sending). */
export async function messageTemplates() {
  const [{ contact }, products] = await Promise.all([getSite(), getProducts()]);
  // The shop's new arrivals (marked in the Studio)
  const fresh = products.filter((p) => p.newArrival).slice(0, 3).map((p) => tidy(p.name));
  const year = new Date().getUTCFullYear();
  return [
    { id: 'new', label: 'New arrivals', text: `New at Flokefama: ${fresh.join(', ') || 'new equipment'} and more. See them at ${siteUrl.replace(/^https?:\/\//, '')}/products or call ${contact.phone}.` },
    { id: 'greeting', label: 'Holiday greeting', text: `Season’s greetings from all of us at Flokefama! Thank you for working with us in ${year}.` },
    { id: 'checkin', label: 'Check-in', text: `Hello from Flokefama. We hope your equipment is working well. If anything needs attention, call us on ${contact.phone} or request a visit in your portal.` },
    { id: 'custom', label: 'Your own message', text: '' },
  ];
}

const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

/* ---------- sending ---------- */

const key = (s: string) => s.trim().toLowerCase();

/** The admin console's "Send to hospitals": one text to every hospital that gets texts. */
export async function textAllHospitals(text: string, ref: string) {
  if (!smsEnabled) return { ok: false, detail: 'Texts are off: set SMS_PROVIDER and SMS_API_KEY in Vercel.', count: 0 };
  const body = plain(text, 300);
  if (body.length < 10) return { ok: false, detail: 'Write the message first.', count: 0 };
  const to = await hospitalsToText();
  if (!to.length) return { ok: false, detail: 'No hospital accounts with a phone number to text yet.', count: 0 };
  const r = await send('hospitals', ref, to.map((h) => h.phone), body);
  return r?.status === 'failed' ? { ok: false, detail: r.detail, count: to.length } : { ok: true, detail: `Sent to ${to.length} hospital${to.length === 1 ? '' : 's'}.`, count: to.length };
}

/**
 * The daily check (9:00): check-ins after repairs, calibration reminders and holiday greetings that are due today.
 * Each goes once: its row id in sms_log is fixed, so a second run (or a second server) skips it.
 */
export async function clientDaily(desk: ServiceState, now = Date.now()) {
  if (!clientTextsAuto) return { checkIns: 0, calibrations: 0, holidays: 0 };
  const { contact } = await getSite();
  const people = await hospitalsToText();
  const phonesAt = (facility: string) => people.filter((h) => key(h.facility) === key(facility)).map((h) => h.phone);
  const done = { checkIns: 0, calibrations: 0, holidays: 0 };
  const once = async (rowId: string, kind: string, ref: string, phones: string[], text: string) => {
    if (!phones.length) return false;
    const r = await send(kind, ref, phones, text, rowId.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 36)).catch(() => undefined);
    return Boolean(r);
  };
  const asset = (id: string) => desk.assets.find((a) => a.id === id);

  // Check-in: jobs resolved 7 to 10 days ago (a few days' grace if a daily run was missed)
  for (const t of desk.tickets) {
    if (t.status !== 'resolved' || !t.resolvedAt) continue;
    const age = now - Date.parse(t.resolvedAt);
    if (age < CHECK_IN_DAYS * DAY || age > (CHECK_IN_DAYS + 3) * DAY) continue;
    const a = asset(t.assetId);
    if (!a) continue;
    const phones = [...phonesAt(a.facility), ...(t.contactPhone ? [t.contactPhone] : [])];
    if (await once(`ci-${t.id}`, 'checkin', t.id, phones, checkInText(plain(a.name, 40), plain(a.facility, 40), fmtDay(new Date(t.resolvedAt)), contact.phone))) done.checkIns++;
  }
  // Calibration: due within the next 14 days (once for each due date)
  for (const a of desk.assets) {
    if (!a.nextCalibration) continue;
    const left = Date.parse(a.nextCalibration) - now;
    if (left < 0 || left > CALIBRATION_NOTICE_DAYS * DAY) continue;
    const due = new Date(a.nextCalibration);
    if (await once(`cal-${a.id}-${due.toISOString().slice(0, 10)}`, 'calibration', a.id, phonesAt(a.facility), calibrationText(plain(a.name, 40), plain(a.facility, 40), fmtDay(due), contact.phone))) done.calibrations++;
  }
  // Holidays: today's greeting, to every hospital
  const today = new Date(now).toISOString().slice(0, 10);
  const year = new Date(now).getUTCFullYear();
  for (const h of holidays(year, contact.phone)) {
    if (h.date.toISOString().slice(0, 10) !== today) continue;
    if (await once(`hol-${h.key}-${year}`, 'holiday', h.name, people.map((p) => p.phone), h.text)) done.holidays++;
  }
  return done;
}

/** What the admin console shows about the automatic texts: when each next goes out. */
export async function upcomingClientTexts(desk: Pick<ServiceState, 'assets' | 'tickets'>, now = Date.now()) {
  const { contact } = await getSite();
  const year = new Date(now).getUTCFullYear();
  const next = [...holidays(year, contact.phone), ...holidays(year + 1, contact.phone)].find((h) => h.date.getTime() >= now - DAY);
  const checkIns = desk.tickets.filter((t) => t.status === 'resolved' && t.resolvedAt && now - Date.parse(t.resolvedAt) < CHECK_IN_DAYS * DAY).length;
  const calibrations = desk.assets.filter((a) => a.nextCalibration && Date.parse(a.nextCalibration) - now > 0 && Date.parse(a.nextCalibration) - now < (CALIBRATION_NOTICE_DAYS + 30) * DAY).length;
  return { next, checkIns, calibrations, phone: contact.phone };
}
