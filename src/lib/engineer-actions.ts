'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { appwrite } from '@/lib/appwrite';
import { accountExists, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession } from '@/lib/auth/server';
import { approve, checkInvite, decline, PENDING_PREFIX, setHead } from '@/lib/engineer-team';
import { limited } from '@/lib/rate-limit';
import { engineerOrganisation, regions } from '@/lib/regions';
import { textAdmins, textPerson } from '@/lib/sms';
import { siteUrl } from '@/lib/utils';

export interface JoinState {
  errors?: Partial<Record<'name' | 'phone' | 'email' | 'region' | 'password' | 'form', string>>;
  values?: Record<string, string>;
  /** Registered: waiting for an admin to approve. */
  done?: { name: string };
}

const schema = z.object({
  code: z.string().min(10),
  name: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter your phone number, e.g. 024 123 4567').max(30),
  email: z.string().trim().toLowerCase().email('Enter your email address'),
  region: z.enum(regions, { message: 'Choose your region' }),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
  website: z.string().optional(),
});

/**
 * An engineer registers with the invite link (/engineer/join?code=…). The account waits for an admin's approval; the
 * admins get a text so they can approve it straight away.
 */
export async function joinAsEngineer(_prev: JoinState, form: FormData): Promise<JoinState> {
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const values = { name: raw.name ?? '', phone: raw.phone ?? '', email: raw.email ?? '', region: raw.region ?? '' };
  if (!(await checkInvite(raw.code))) return { errors: { form: 'This invite link has expired. Ask your manager for a new one.' }, values };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: JoinState['errors'] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof NonNullable<JoinState['errors']>] ??= issue.message;
    return { errors, values };
  }
  const d = parsed.data;
  if (d.website) return {}; // a bot filled the hidden field
  const ip = ((await headers()).get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (limited(`join:${ip}`, 10, 60 * 60_000)) return { errors: { form: 'Too many registrations from this connection. Please try again in an hour.' }, values };
  if (!appwrite) return { errors: { form: 'Registration isn’t open yet (the database isn’t connected). Please tell your manager.' }, values };
  try {
    if (await accountExists(d.email)) return { errors: { email: 'There is already an account with this email. Sign in at the engineer portal instead.' }, values };
    const { salt, hash } = await hashPassword(d.password);
    await saveAccount({ id: `${PENDING_PREFIX}${crypto.randomUUID().slice(0, 8)}`, name: d.name, email: d.email, organisation: engineerOrganisation(d.region), phone: d.phone, salt, hash });
  } catch {
    return { errors: { form: 'We couldn’t save your registration. Check your connection and try again.' }, values };
  }
  await textAdmins('engineer-join', d.email, `New engineer to approve: ${d.name} (${d.region}), ${d.phone}. Approve: ${siteUrl}/admin?tab=team`).catch((e) => console.error('join: admin text failed', e));
  revalidatePath('/admin');
  return { done: { name: d.name } };
}

/** Admin console → Engineers: approve a registration. The engineer gets a text with where to sign in. */
export async function approveEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  const who = await approve(String(form.get('id') ?? '')).catch((e) => (console.error('approve failed', e), null));
  if (who?.phone) await textPerson('engineer-approved', who.name, who.phone, `Hello ${who.name.split(' ')[0]}, your Flokefama engineer account is approved. Sign in: ${siteUrl}/engineer/login`).catch(() => {});
  revalidatePath('/admin');
}

/** Admin console → Engineers: make an engineer the head of engineering, or not. */
export async function setHeadEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  await setHead(String(form.get('id') ?? ''), form.get('on') === '1').catch((e) => console.error('set head failed', e));
  revalidatePath('/admin');
}

/** Admin console → Engineers: decline a registration (deletes it). */
export async function declineEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  await decline(String(form.get('id') ?? '')).catch((e) => console.error('decline failed', e));
  revalidatePath('/admin');
}
