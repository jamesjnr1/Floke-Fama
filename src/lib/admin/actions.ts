'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { accountExists, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession } from '@/lib/auth/server';
import { ENGINEER_ID_PREFIX } from '@/lib/auth/users';
import type { OrderStatus, SavedOrder } from '@/lib/orders';
import { salesStages, stageLabel } from '@/lib/sales-stages';
import { sendTestSms } from '@/lib/sms';
import { textAllHospitals } from '@/lib/client-sms';

/** Reads an order, changes it and writes it back, with a line in its log saying who did what. Admins only. */
async function changeOrder(reference: string, change: (o: SavedOrder) => { order: SavedOrder; log?: string } | null) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite || !/^FF-[A-Z0-9]{4,12}$/.test(reference)) return;
  const row = await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference });
  const order = JSON.parse(String((row as unknown as { data: string }).data)) as SavedOrder;
  const next = change(order);
  if (!next) return;
  const log = next.log ? [...(order.log ?? []), { at: new Date().toISOString(), by: s.name, text: next.log }].slice(-100) : order.log;
  await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference, data: { data: JSON.stringify({ ...next.order, log }) } });
  revalidatePath('/admin');
}

/** Moves an order to another column of the sales board. */
export async function setOrderStatus(form: FormData) {
  const status = String(form.get('status') ?? '') as OrderStatus;
  if (!salesStages.some((x) => x.id === status)) return;
  await changeOrder(String(form.get('reference') ?? ''), (o) => (o.status === status ? null : { order: { ...o, status }, log: `Moved to ${stageLabel(status)}` }));
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

/** Removes an engineer account the console created (an `eng-` id); their past jobs stay on the service desk. */
export async function removeEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite) return;
  const id = String(form.get('id') ?? '');
  if (!/^eng-[a-z0-9]{8}$/.test(id)) return;
  await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.accounts, rowId: id });
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
