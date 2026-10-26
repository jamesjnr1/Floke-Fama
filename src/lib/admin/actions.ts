'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { accountExists, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession } from '@/lib/auth/server';
import { ENGINEER_ID_PREFIX } from '@/lib/auth/users';
import type { OrderStatus, SavedOrder } from '@/lib/orders';

const statuses: OrderStatus[] = ['awaiting-payment', 'paid', 'processing', 'delivered'];

/** Moves an order along (awaiting payment → paid → being prepared → delivered). Admins only. */
export async function setOrderStatus(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin' || !appwrite) return;
  const reference = String(form.get('reference') ?? '');
  const status = String(form.get('status') ?? '') as OrderStatus;
  if (!/^FF-[A-Z0-9]{4,12}$/.test(reference) || !statuses.includes(status)) return;
  const row = await appwrite.tables.getRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference });
  const order = JSON.parse(String((row as unknown as { data: string }).data)) as SavedOrder;
  await appwrite.tables.updateRow({ databaseId: DATABASE_ID, tableId: TABLES.orders, rowId: reference, data: { data: JSON.stringify({ ...order, status }) } });
  revalidatePath('/admin');
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
