'use server';

import { randomInt } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { appwrite } from '@/lib/appwrite';
import { accountExists, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession } from '@/lib/auth/server';
import { roleFor } from '@/lib/auth/users';
import { ensureFacility, findFacility, listFacilities, updateFacility } from '@/lib/facility-registry';
import { regions } from '@/lib/regions';

/**
 * Admin console → Hospitals: register a hospital (it gets its code at once), edit its details, make it active or
 * inactive, and give its staff logins. Admins only; never from the demo (a demo session isn't an admin session here).
 */
const phone = z.string().trim().regex(/^([+\d][\d\s()-]{6,})?$/, 'Enter a valid phone number').max(30);
const email = z.union([z.literal(''), z.string().trim().toLowerCase().email('Enter a valid email')]);
const details = z.object({
  region: z.union([z.literal(''), z.enum(regions)]),
  address: z.string().trim().max(300),
  contactName: z.string().trim().max(120),
  phone,
  email,
});

/** A password to give the hospital once (they can change it in their portal): easy to read out over the phone. */
const newPassword = () => {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const pick = (s: string) => s[randomInt(s.length)];
  return `${Array.from({ length: 4 }, () => pick(letters)).join('')}-${randomInt(1000, 9999)}-${Array.from({ length: 4 }, () => pick(letters)).join('')}`;
};

export interface HospitalFormState {
  errors?: Partial<Record<'name' | 'region' | 'address' | 'contactName' | 'phone' | 'email' | 'form', string>>;
  values?: Record<string, string>;
  /** Registered (or a login added): the code, and the login to pass on (the password is shown only this once). */
  done?: { code: string; name: string; login?: { email: string; password: string } };
}

const read = (form: FormData) => Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
const firstErrors = (issues: z.ZodIssue[]) => {
  const errors: HospitalFormState['errors'] = {};
  for (const i of issues) errors[i.path[0] as keyof NonNullable<HospitalFormState['errors']>] ??= i.message;
  return errors;
};

/** Creates a hospital login (an account linked to the hospital by its registered name). */
async function createLogin(facility: string, name: string, emailAddress: string, phoneNumber: string) {
  if (roleFor(emailAddress) !== 'client') throw new Error('staff email');
  if (await accountExists(emailAddress)) throw new Error('exists');
  const password = newPassword();
  const { salt, hash } = await hashPassword(password);
  await saveAccount({ id: `hos-${crypto.randomUUID().slice(0, 8)}`, name, email: emailAddress, organisation: facility, phone: phoneNumber, salt, hash });
  return password;
}

export async function registerHospital(_prev: HospitalFormState, form: FormData): Promise<HospitalFormState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { errors: { form: 'Only admins can register hospitals.' } };
  const raw = read(form);
  const parsed = details.extend({ name: z.string().trim().min(2, 'Enter the hospital’s name').max(160) }).safeParse(raw);
  if (!parsed.success) return { errors: firstErrors(parsed.error.issues), values: raw };
  const d = parsed.data;
  if (!appwrite) return { errors: { form: 'The database isn’t connected.' }, values: raw };
  const login = raw.login === 'on';
  if (login && (!d.email || !d.contactName)) return { errors: { email: 'A login needs the contact’s name and email.' }, values: raw };
  try {
    // The same hospital (whatever the capitals, spaces or punctuation) can't be registered twice
    const existing = findFacility(await listFacilities(), d.name);
    if (existing) return { errors: { name: `Already registered as ${existing.code} (${existing.name}).` }, values: raw };
    if (login && (await accountExists(d.email))) return { errors: { email: 'There is already an account with this email.' }, values: raw };
    const f = await ensureFacility(d.name, { region: d.region, address: d.address, contactName: d.contactName, phone: d.phone, email: d.email }, s.name);
    if (!f) return { errors: { form: 'Not saved. Please try again.' }, values: raw };
    const password = login ? await createLogin(f.name, d.contactName, d.email, d.phone) : undefined;
    revalidatePath('/admin');
    return { done: { code: f.code, name: f.name, login: password ? { email: d.email, password } : undefined } };
  } catch (e) {
    console.error('register hospital', e);
    return { errors: { form: 'Not saved. Please try again.' }, values: raw };
  }
}

/** Edits a hospital's details (its name and code stay). */
export async function editHospital(_prev: HospitalFormState, form: FormData): Promise<HospitalFormState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { errors: { form: 'Only admins can edit hospitals.' } };
  const raw = read(form);
  const parsed = details.safeParse(raw);
  if (!parsed.success) return { errors: firstErrors(parsed.error.issues), values: raw };
  try {
    await updateFacility(String(raw.code ?? ''), parsed.data);
  } catch {
    return { errors: { form: 'Not saved. Please try again.' }, values: raw };
  }
  revalidatePath('/admin');
  return { done: { code: raw.code ?? '', name: '' } };
}

/** Makes a hospital active or inactive (inactive: its staff can't sign in or use the dashboard). */
export async function setHospitalStatus(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  const code = String(form.get('code') ?? '');
  await updateFacility(code, { status: form.get('status') === 'inactive' ? 'inactive' : 'active' }).catch((e) => console.error('hospital status', e));
  revalidatePath('/admin');
  redirect(`/admin?tab=hospitals&code=${encodeURIComponent(code)}`);
}

/** Another login for an authorised person at a registered hospital. */
export async function addHospitalLogin(_prev: HospitalFormState, form: FormData): Promise<HospitalFormState> {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return { errors: { form: 'Only admins can add logins.' } };
  const raw = read(form);
  const parsed = z.object({ contactName: z.string().trim().min(2, 'Enter their name').max(120), email: z.string().trim().toLowerCase().email('Enter their email'), phone }).safeParse(raw);
  if (!parsed.success) return { errors: firstErrors(parsed.error.issues), values: raw };
  const f = (await listFacilities()).find((x) => x.code === raw.code);
  if (!f) return { errors: { form: 'Unknown hospital.' }, values: raw };
  try {
    const password = await createLogin(f.name, parsed.data.contactName, parsed.data.email, parsed.data.phone);
    revalidatePath('/admin');
    return { done: { code: f.code, name: f.name, login: { email: parsed.data.email, password } } };
  } catch (e) {
    const m = (e as Error).message;
    return { errors: { email: m === 'exists' ? 'There is already an account with this email.' : m === 'staff email' ? 'That email belongs to Flokefama staff.' : 'Not saved. Please try again.' }, values: raw };
  }
}
