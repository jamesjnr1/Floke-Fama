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
 * - greetings on five days a year: Independence Day, Easter, World Health Day, Breast Cancer Awareness Month and
 *   Christmas (with New Year). The other days in the calendar are ready to send from the admin console;
 *   CLIENT_TEXTS_ADD=nurses,heart sends some automatically too, CLIENT_TEXTS_SKIP=easter leaves one out.
 * The admin console also sends to all hospitals at once (new arrivals, Eid and other moving holidays, news).
 * Each goes once (recorded in sms_log). Hospitals can turn them off in their portal (table sms_optout).
 * CLIENT_TEXTS=off stops the automatic ones; sending from the admin console still works.
 */
export const clientTextsAuto = smsEnabled && (process.env.CLIENT_TEXTS ?? 'on').trim().toLowerCase() !== 'off';
export const CHECK_IN_DAYS = 7;
export const CALIBRATION_NOTICE_DAYS = 14;
/** Greetings can run to three SMS parts (459 plain characters); work texts stay short. */
export const GREETING_MAX = 459;
const keys = (v?: string) => new Set((v ?? '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean));
const skipped = keys(process.env.CLIENT_TEXTS_SKIP);
const added = keys(process.env.CLIENT_TEXTS_ADD);
/** The greetings sent automatically, to keep texts to hospitals few. */
const AUTO = new Set(['independence', 'easter', 'health', 'breast', 'christmas']);
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

const sign = 'Warm regards from all of us at Flokefama.';

/**
 * The holidays and health days, in date order, with their text. Five go out automatically (AUTO); `off` marks the
 * rest, which the admin console can send. Eid and other holidays whose date moves are sent from there too.
 */
export function occasions(year: number) {
  const on = (m: number, d: number) => new Date(Date.UTC(year, m - 1, d));
  const all = [
    { key: 'newyear', name: 'New Year’s Day', date: on(1, 1), text: `Happy New Year from Flokefama! Thank you for your trust and support over the past year. May ${year} bring you and your team good health, peace and success. We remain committed to advancing healthcare through reliable medical equipment and dependable service. We look forward to serving you even better this year. Warm wishes from all of us at Flokefama!` },
    { key: 'cancer', name: 'World Cancer Day', date: on(2, 4), text: `Today is World Cancer Day. We honour the doctors, nurses and laboratory teams who work every day to detect cancer early and care for patients and their families. Thank you for the difference you make. Flokefama is proud to support your work with reliable diagnostic equipment and service. ${sign}` },
    { key: 'independence', name: 'Independence Day', date: on(3, 6), text: 'Happy Independence Day from Flokefama! As Ghana celebrates, we salute every hospital, clinic and laboratory caring for our people. Thank you for your trust and partnership. Together we are building a healthier Ghana, and we remain committed to supporting you with reliable medical equipment and solutions. Warm wishes from all of us at Flokefama!' },
    { key: 'women', name: 'International Women’s Day', date: on(3, 8), text: `Happy International Women's Day from Flokefama! Today we celebrate the women in healthcare, the nurses, midwives, doctors, scientists and leaders whose care and strength keep our hospitals running. Thank you for all you do for patients and families every day. ${sign}` },
    { key: 'tb', name: 'World TB Day', date: on(3, 24), text: `Today is World TB Day. TB is preventable and curable, and early diagnosis saves lives. Thank you to every health worker and laboratory team testing, treating and caring for patients. Flokefama is proud to support your work with reliable laboratory and imaging equipment. ${sign}` },
    { key: 'easter', name: 'Easter Sunday', date: easterSunday(year), text: 'Happy Easter from Flokefama! May the joy and hope of this season fill you, your team and your loved ones. Thank you for your trust and partnership. We remain committed to supporting your care for patients with reliable medical equipment and service. Wishing you a blessed and peaceful Easter. Warm wishes from all of us at Flokefama!' },
    { key: 'health', name: 'World Health Day', date: on(4, 7), text: `Happy World Health Day from Flokefama! Today we celebrate everyone working for a healthier Ghana, and we thank you for the care you give your patients every day. We remain committed to advancing healthcare through reliable medical equipment, training and service that support better patient care. Wishing you and your team good health. ${sign}` },
    { key: 'malaria', name: 'World Malaria Day', date: on(4, 25), text: `Today is World Malaria Day. Thank you for your work testing, treating and preventing malaria in our communities. Every quick, accurate diagnosis saves lives, and Flokefama is proud to support your laboratory with reliable analysers and service. Together we can end malaria. ${sign}` },
    { key: 'nurses', name: 'International Nurses Day', date: on(5, 12), text: 'Happy International Nurses Day from Flokefama! To every nurse and midwife on your team: thank you for your compassion, your skill and the long hours you give to patients and their families. You are the heart of healthcare. Warm wishes and deep appreciation from all of us at Flokefama.' },
    { key: 'blood', name: 'World Blood Donor Day', date: on(6, 14), text: `Today is World Blood Donor Day. We thank every donor, and every blood bank and laboratory team, whose work gives patients a second chance at life. Flokefama is proud to support safe blood services with reliable equipment and service. ${sign}` },
    { key: 'hepatitis', name: 'World Hepatitis Day', date: on(7, 28), text: `Today is World Hepatitis Day. Testing, vaccination and early treatment save lives. Thank you to every health worker and laboratory team leading this fight in our communities. Flokefama is proud to support your work with reliable diagnostic equipment. ${sign}` },
    { key: 'heart', name: 'World Heart Day', date: on(9, 29), text: `Happy World Heart Day from Flokefama! Regular checks and early care save lives. Thank you for caring for your patients' hearts every day. We are proud to support you with reliable patient monitors, ECG machines and service. ${sign}` },
    { key: 'breast', name: 'Breast Cancer Awareness Month', date: on(10, 1), text: `October is Breast Cancer Awareness Month. Early detection saves lives. We honour every patient, survivor and health worker in this fight, and thank you for the screening and care you provide. Flokefama is proud to support your work with reliable imaging and diagnostic equipment. ${sign}` },
    { key: 'diabetes', name: 'World Diabetes Day', date: on(11, 14), text: `Today is World Diabetes Day. Regular testing and early care help people live long, healthy lives with diabetes. Thank you for the care you give your patients every day. Flokefama is proud to support your laboratory with reliable analysers and service. ${sign}` },
    { key: 'aids', name: 'World AIDS Day', date: on(12, 1), text: `Today is World AIDS Day. We remember those we have lost and honour every health worker testing, treating and supporting people living with HIV. Thank you for your care and commitment. Flokefama is proud to support your work with reliable laboratory equipment. ${sign}` },
    { key: 'christmas', name: 'Christmas Day', date: on(12, 25), text: 'Merry Christmas and Happy New Year from Flokefama! Thank you for your trust and support. May this season bring you and your loved ones joy, peace, and good health. We remain committed to advancing healthcare through reliable medical equipment and solutions that support better patient care. We look forward to serving you better in the coming year. Warm wishes from all of us at Flokefama!' },
  ];
  return all.sort((a, b) => a.date.getTime() - b.date.getTime()).map((o) => ({ ...o, off: skipped.has(o.key) || !(AUTO.has(o.key) || added.has(o.key)) }));
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
    { id: 'eid', label: 'Eid greeting', text: 'Eid Mubarak from Flokefama! As you celebrate, we wish you, your team and your loved ones peace, joy and good health. Thank you for your trust and partnership. We remain committed to supporting your care for patients with reliable medical equipment and service. Warm wishes from all of us at Flokefama!' },
    { id: 'greeting', label: 'Thank you', text: `Thank you from Flokefama! We are grateful for your trust and partnership in ${year}. Our engineers remain ready to support you; call ${contact.phone} or request a visit in your Flokefama portal. ${sign}` },
    { id: 'checkin', label: 'Check-in', text: `Hello from Flokefama. We hope your equipment is working well. If anything needs attention, call us on ${contact.phone} or request a visit in your portal.` },
    { id: 'custom', label: 'Your own message', text: '' },
    // Every greeting in the calendar, to send one that doesn't go automatically (or send one again)
    ...occasions(year).map((o) => ({ id: o.key, label: o.name, text: o.text, greeting: true })),
  ];
}

const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

/* ---------- sending ---------- */

const key = (s: string) => s.trim().toLowerCase();

/** The admin console's "Send to hospitals": one text to every hospital that gets texts. */
export async function textAllHospitals(text: string, ref: string) {
  if (!smsEnabled) return { ok: false, detail: 'Texts are off: set SMS_PROVIDER and SMS_API_KEY in Vercel.', count: 0 };
  const body = plain(text, GREETING_MAX);
  if (body.length < 10) return { ok: false, detail: 'Write the message first.', count: 0 };
  const to = await hospitalsToText();
  if (!to.length) return { ok: false, detail: 'No hospital accounts with a phone number to text yet.', count: 0 };
  const r = await send('hospitals', ref, to.map((h) => h.phone), body, undefined, GREETING_MAX);
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
    const r = await send(kind, ref, phones, text, rowId.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 36), GREETING_MAX).catch(() => undefined);
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
  // Holidays and health days: today's greeting, to every hospital
  const today = new Date(now).toISOString().slice(0, 10);
  const year = new Date(now).getUTCFullYear();
  for (const h of occasions(year)) {
    if (h.off || h.date.toISOString().slice(0, 10) !== today) continue;
    if (await once(`hol-${h.key}-${year}`, 'holiday', h.name, people.map((p) => p.phone), h.text)) done.holidays++;
  }
  return done;
}

/** What the admin console shows about the automatic texts: when each next goes out. */
export async function upcomingClientTexts(desk: Pick<ServiceState, 'assets' | 'tickets'>, now = Date.now()) {
  const { contact } = await getSite();
  const year = new Date(now).getUTCFullYear();
  const calendar = [...occasions(year), ...occasions(year + 1)].filter((h) => h.date.getTime() >= now - DAY && h.date.getTime() < now + 365 * DAY);
  const next = calendar.find((h) => !h.off);
  const checkIns = desk.tickets.filter((t) => t.status === 'resolved' && t.resolvedAt && now - Date.parse(t.resolvedAt) < CHECK_IN_DAYS * DAY).length;
  const calibrations = desk.assets.filter((a) => a.nextCalibration && Date.parse(a.nextCalibration) - now > 0 && Date.parse(a.nextCalibration) - now < (CALIBRATION_NOTICE_DAYS + 30) * DAY).length;
  return { next, calendar, checkIns, calibrations, phone: contact.phone };
}
