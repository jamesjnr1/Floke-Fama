'use server';

import { ticketIdPattern } from '@/lib/service/desk';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { accountExists, findAccount, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession, getConsoleSession } from '@/lib/auth/server';
import { ADMIN_ID_PREFIX, ENGINEER_ID_PREFIX, roleFor } from '@/lib/auth/users';
import { Query, type Models } from 'node-appwrite';
import { forgetTeam } from '@/lib/engineer-team';
import { assignByAdmin, DeskError, releaseEngineerJobs, removeOrderEquipment } from '@/lib/service/server';
import type { OrderStatus, SavedOrder } from '@/lib/orders';
import { salesStages, stageLabel } from '@/lib/sales-stages';
import { sendTestSms, sendWrittenMessage } from '@/lib/sms';
import { sharedLimited } from '@/lib/shared-limit';
import { textAllHospitals } from '@/lib/client-sms';
import { normalisePhone, phoneHint, showPhone } from '@/lib/phone';
import { dismissError } from '@/lib/monitor';

/** Reads an order, changes it and writes it back, with a line in its log saying who did what. Admins and the sales team. */
async function changeOrder(reference: string, change: (o: SavedOrder) => { order: SavedOrder; log?: string } | null) {
  const s = await getConsoleSession();
  if (!s || !appwrite || !/^FF-[A-Z0-9]{4,12}$/.test(reference)) return;
  const read = () => appwrite!.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference }) as Promise<Models.Row & { data: string }>;
  // Two people on one order: the change is made on the latest copy, and checked again just before saving, so a
  // colleague's move or note a moment earlier is never overwritten (tried again on the newer copy)
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await read();
    const order = JSON.parse(String(row.data)) as SavedOrder;
    const next = change(order);
    if (!next) break;
    const log = next.log ? [...(order.log ?? []), { at: new Date().toISOString(), by: s.name, text: next.log }].slice(-100) : order.log;
    if ((await read()).$updatedAt !== row.$updatedAt) continue;
    await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference, data: { data: JSON.stringify({ ...next.order, log }) } });
    break;
  }
  revalidatePath('/admin');
}

export interface AssignState { result?: { ok: boolean; detail: string } }

/** Admin console → Service desk: gives a job nobody has taken to an engineer. Admins only. */
export async function assignEngineer(_prev: AssignState, form: FormData): Promise<AssignState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { result: { ok: false, detail: 'Please sign in again.' } };
  const ticket = String(form.get('ticket') ?? '');
  const email = String(form.get('engineer') ?? '').trim().toLowerCase();
  if (!ticketIdPattern.test(ticket) || !email) return { result: { ok: false, detail: 'Choose an engineer.' } };
  const acc = await findAccount(email);
  if (!acc || roleFor(acc.email, acc.id) !== 'engineer') return { result: { ok: false, detail: 'That person is not an engineer.' } };
  try {
    await assignByAdmin(s.name, ticket, { name: acc.name, phone: acc.phone });
  } catch (e) {
    return { result: { ok: false, detail: e instanceof DeskError ? e.message : 'Not saved. Please try again.' } };
  }
  revalidatePath('/admin');
  return { result: { ok: true, detail: `${ticket} is now ${acc.name}’s. They and the hospital have been told.` } };
}

/** Moves an order to another column of the sales board. */
export async function setOrderStatus(form: FormData) {
  const status = String(form.get('status') ?? '') as OrderStatus;
  const from = String(form.get('from') ?? '');
  if (!salesStages.some((x) => x.id === status)) return;
  // Moved by someone else since this page was opened: leave it (the page then shows where it is now)
  await changeOrder(String(form.get('reference') ?? ''), (o) => (o.status === status || (from && o.status !== from) ? null : { order: { ...o, status }, log: `Moved to ${stageLabel(status)}` }));
}

/** Saves the agreed price (Ghana cedis) and/or adds a note, from the order's page on the sales board. */
export async function saveOrderNote(form: FormData) {
  const rawAmount = String(form.get('amount') ?? '').replace(/[,\s]/g, '');
  const amount = rawAmount ? Number(rawAmount) : undefined;
  const note = String(form.get('note') ?? '').trim().slice(0, 1000);
  if (amount !== undefined && !(Number.isFinite(amount) && amount >= 0 && amount < 1e9)) return;
  await changeOrder(String(form.get('reference') ?? ''), (o) => {
    const priceChanged = amount !== undefined && amount !== o.amount;
    if (!priceChanged && !note) return null;
    const lines = [priceChanged ? `Price set to GHS ${amount!.toLocaleString('en-GB')}` : '', note].filter(Boolean);
    return { order: priceChanged ? { ...o, amount } : o, log: lines.join(': ') };
  });
}

export interface AddEngineerState {
  errors?: Partial<Record<'name' | 'email' | 'phone' | 'password' | 'form', string>>;
  values?: Record<string, string>;
  /** Set once the engineer is created: what to pass on to them (the password is shown only this once). */
  done?: { name: string; email: string; password: string };
}

const engineerSchema = z.object({
  name: z.string().trim().min(2, 'Enter the engineer’s full name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
});

/**
 * Admin console → Accounts → Add engineer: creates an engineer account (Flokefama, `eng-` id) that signs in to the
 * engineer portal straight away. Admins only; needs the database (Appwrite).
 */
export async function addEngineer(_prev: AddEngineerState, form: FormData): Promise<AddEngineerState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { errors: { form: 'Only admins can add engineers.' } };
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const values = { name: raw.name ?? '', email: raw.email ?? '', phone: raw.phone ?? '' };
  const parsed = engineerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: AddEngineerState['errors'] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof NonNullable<AddEngineerState['errors']>] ??= issue.message;
    return { errors, values };
  }
  const d = parsed.data;
  if (!appwrite) return { errors: { form: 'The database (Appwrite) isn’t connected, so accounts can’t be created here yet.' }, values };
  try {
    if (await accountExists(d.email)) return { errors: { email: 'There is already an account with this email.' }, values };
    const { salt, hash } = await hashPassword(d.password);
    await saveAccount({ id: `${ENGINEER_ID_PREFIX}${crypto.randomUUID().slice(0, 8)}`, name: d.name, email: d.email, organisation: 'Flokefama', phone: d.phone, salt, hash });
  } catch {
    return { errors: { form: 'The database couldn’t be reached. Please try again.' }, values };
  }
  revalidatePath('/admin');
  return { done: { name: d.name, email: d.email, password: d.password } };
}

export interface AddAdminState {
  errors?: Partial<Record<'name' | 'email' | 'phone' | 'password' | 'form', string>>;
  values?: Record<string, string>;
  /** Set once the admin is created: what to pass on to them (the password is shown only this once). */
  done?: { name: string; email: string; password: string };
}

const adminSchema = z.object({
  name: z.string().trim().min(2, 'Enter the person’s full name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z.union([z.literal(''), z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number')]),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
});

/**
 * Admin console → Database & settings → Admins → Add admin: creates an account (an `adm-` id) that signs in to the
 * admin console straight away, with full access. Admins only (not the sales team); needs the database (Appwrite).
 */
export async function addAdmin(_prev: AddAdminState, form: FormData): Promise<AddAdminState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { errors: { form: 'Only admins can add admins.' } };
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const values = { name: raw.name ?? '', email: raw.email ?? '', phone: raw.phone ?? '' };
  const parsed = adminSchema.safeParse({ ...raw, phone: raw.phone ?? '' });
  if (!parsed.success) {
    const errors: AddAdminState['errors'] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof NonNullable<AddAdminState['errors']>] ??= issue.message;
    return { errors, values };
  }
  const d = parsed.data;
  if (!appwrite) return { errors: { form: 'The database (Appwrite) isn’t connected, so accounts can’t be created here yet.' }, values };
  try {
    if (await accountExists(d.email)) return { errors: { email: 'There is already an account with this email.' }, values };
    const { salt, hash } = await hashPassword(d.password);
    await saveAccount({ id: `${ADMIN_ID_PREFIX}${crypto.randomUUID().slice(0, 8)}`, name: d.name, email: d.email, organisation: 'Flokefama', phone: d.phone, salt, hash });
  } catch {
    return { errors: { form: 'The database couldn’t be reached. Please try again.' }, values };
  }
  console.info(`[admin] ${s.email} added admin ${d.email}`);
  revalidatePath('/admin');
  return { done: { name: d.name, email: d.email, password: d.password } };
}

export interface AdminPhoneState {
  error?: string;
  saved?: string;
}

/**
 * Admin console → Database & settings → Admins: an admin's phone number, for the texts admins get (a new engineer
 * joining, urgent jobs nobody has taken). Any admin can set it for any admin account; empty clears it.
 */
export async function setAdminPhone(_prev: AdminPhoneState, form: FormData): Promise<AdminPhoneState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { error: 'Please sign in again.' };
  if (!appwrite) return { error: 'The database isn’t connected.' };
  const id = String(form.get('id') ?? '');
  const raw = String(form.get('phone') ?? '').trim().slice(0, 40);
  if (raw && !normalisePhone(raw)) return { error: phoneHint };
  const row = await appwrite.tables.getRow<Models.Row & { email?: string }>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id }).catch(() => null);
  if (!row || roleFor(String(row.email ?? ''), row.$id) !== 'admin') return { error: 'That admin account wasn’t found. Refresh the page and try again.' };
  const phone = raw ? showPhone(raw) : '';
  try {
    await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id, data: { phone } });
  } catch (e) {
    console.error('admin phone not saved', id, e);
    return { error: 'It couldn’t be saved (the database didn’t answer). Please try again.' };
  }
  console.info(`[admin] ${s.email} set the phone of admin ${row.email}`);
  revalidatePath('/admin');
  return { saved: phone || 'cleared' };
}

/** Removes an admin the console added (an `adm-` id). Admins listed in ADMIN_EMAILS are removed in Vercel; no one removes themselves. */
export async function removeAdmin(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite) return;
  const id = String(form.get('id') ?? '');
  if (!/^adm-[a-z0-9]{8}$/.test(id) || id === s.sub) return;
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
  console.info(`[admin] ${s.email} removed admin ${id}`);
  revalidatePath('/admin');
  redirect('/admin?tab=system');
}

/** Removes an engineer account the console created (an `eng-` id); their past jobs stay on the service desk. */
export async function removeEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite) return;
  const id = String(form.get('id') ?? '');
  if (!/^eng-[a-z0-9]{8}$/.test(id)) return;
  const row = await appwrite.tables.getRow<Models.Row & { name?: string }>({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id }).catch(() => null);
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
  forgetTeam();
  // Their open jobs go back to the queue (urgent ones straight to another engineer), so none is left with nobody
  if (row?.name) await releaseEngineerJobs(row.name).catch((e) => console.error('remove engineer: releasing jobs failed', e));
  revalidatePath('/admin');
  redirect('/admin?tab=accounts&role=engineer');
}

export interface TestSmsState {
  result?: { ok: boolean; detail: string };
  phone?: string;
}

/** Admin console → Database & settings: one test text to the number given, through the real gateway. Admins only. */
export async function testSms(_prev: TestSmsState, form: FormData): Promise<TestSmsState> {
  const s = await getAdminSession();
  if (!s) return { result: { ok: false, detail: 'Please sign in again.' } };
  const phone = String(form.get('phone') ?? '').trim().slice(0, 30);
  return { phone, result: await sendTestSms(phone, s.name) };
}

export interface ClearOrdersState {
  error?: string;
  done?: { orders: number; assets: number; tickets: number };
}

/**
 * Admin console → Database & settings → Clear test orders: deletes every order (so the console's order figures and
 * Product demand start again from nothing) and, unless unticked, the equipment and installation jobs those orders
 * added to the service desk. Accounts, hospitals, engineers and everything else stay. Admins only; typed confirmation.
 */
export async function clearTestOrders(_prev: ClearOrdersState, form: FormData): Promise<ClearOrdersState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { error: 'Only admins can do this.' };
  if (String(form.get('confirm') ?? '').trim().toUpperCase() !== 'DELETE ORDERS') return { error: 'Type DELETE ORDERS to confirm.' };
  if (!appwrite) return { error: 'The database isn’t connected.' };
  try {
    const rows: (Models.Row & { data: string })[] = [];
    let cursor: string | undefined;
    for (let i = 0; i < 40; i++) {
      const page = await appwrite.tables.listRows<Models.Row & { data: string }>({ databaseId: DATABASE_ID, tableId: TABLES.orders, queries: [Query.limit(500), ...(cursor ? [Query.cursorAfter(cursor)] : [])] });
      rows.push(...page.rows);
      if (page.rows.length < 500) break;
      cursor = page.rows[page.rows.length - 1].$id;
    }
    const orders = rows.flatMap((r) => {
      try {
        return [JSON.parse(r.data) as SavedOrder];
      } catch {
        return [];
      }
    });
    let removed = { assets: 0, tickets: 0 };
    if (form.get('equipment') === 'on') {
      const orgOf = new Map<string, string | undefined>();
      for (const o of orders) if (!orgOf.has(o.account)) orgOf.set(o.account, (await findAccount(o.account).catch(() => null))?.organisation ?? o.contact?.organisation);
      removed = await removeOrderEquipment(orders.map((o) => ({ reference: o.reference, placedAt: o.placedAt, facility: orgOf.get(o.account), slugs: o.items.map((i) => i.slug) })));
    }
    for (const r of rows) await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: r.$id });
    console.info(`[admin] ${s.email} cleared ${rows.length} orders, ${removed.assets} items of equipment, ${removed.tickets} jobs`);
    revalidatePath('/admin');
    return { done: { orders: rows.length, ...removed } };
  } catch (e) {
    console.error('clear orders failed', e);
    return { error: 'Not everything was cleared (the database didn’t answer). Press it again to finish.' };
  }
}

export interface MessageState {
  result?: { ok: boolean; detail: string };
  to?: string;
  message?: string;
}

/** Admin console → Text messages: a message written by hand, to up to 5 numbers. Admins only (not sales). */
export async function sendMessage(_prev: MessageState, form: FormData): Promise<MessageState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { result: { ok: false, detail: 'Please sign in again as an admin.' } };
  const to = String(form.get('to') ?? '').slice(0, 200);
  const message = String(form.get('message') ?? '').slice(0, 2000);
  if (await sharedLimited(`admin-message:${s.email}`, 30, 60 * 60_000)) return { to, message, result: { ok: false, detail: 'That is a lot of messages in an hour. Please try again later.' } };
  const result = await sendWrittenMessage(to, message, s.name);
  revalidatePath('/admin');
  // Sent: clear the box, so the same message isn't sent twice by accident
  return result.ok ? { result } : { to, message, result };
}

export interface HospitalTextState {
  result?: { ok: boolean; detail: string };
  text?: string;
}

/** Admin console → Text messages → Send to hospitals: one text to every hospital that gets texts. Admins only. */
export async function sendToHospitals(_prev: HospitalTextState, form: FormData): Promise<HospitalTextState> {
  const s = await getAdminSession();
  if (!s) return { result: { ok: false, detail: 'Please sign in again.' } };
  const text = String(form.get('text') ?? '').trim().slice(0, 459);
  if (form.get('confirm') !== 'on') return { text, result: { ok: false, detail: 'Tick the box to confirm who it goes to.' } };
  const r = await textAllHospitals(text, `ALL-${new Date().toISOString().slice(0, 10)}`);
  revalidatePath('/admin');
  return { text: r.ok ? '' : text, result: r };
}

/** Admin console → Site health: takes an error off the list once dealt with (it comes back if it happens again). */
export async function dismissSiteError(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  await dismissError(String(form.get('id') ?? '')).catch((e) => console.error('dismiss site error failed', e));
  revalidatePath('/admin');
}
