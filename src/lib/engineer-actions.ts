'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { appwrite } from '@/lib/appwrite';
import { accountExists, hashPassword, saveAccount } from '@/lib/auth/accounts';
import { getAdminSession } from '@/lib/auth/server';
import { approve, checkInvite, decline, forgetTeam, PENDING_PREFIX, setHead } from '@/lib/engineer-team';
import { ENGINEER_ID_PREFIX } from '@/lib/auth/users';
import { sharedLimited } from '@/lib/shared-limit';
import { engineerOrganisation, regions } from '@/lib/regions';
import { textAdmins, textPerson } from '@/lib/sms';
import { siteUrl } from '@/lib/utils';
import { normalisePhone, phoneHint, showPhone } from '@/lib/phone';

export interface JoinState {
  errors?: Partial<Record<'name' | 'phone' | 'email' | 'region' | 'password' | 'form', string>>;
  values?: Record<string, string>;
  /** Registered. `waiting`: an admin must approve first (ENGINEER_APPROVAL=on); otherwise they can sign in now. */
  done?: { name: string; waiting: boolean };
}

const schema = z.object({
  code: z.string().min(10),
  name: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z.string().trim().max(30).refine((v) => normalisePhone(v), phoneHint),
  email: z.string().trim().toLowerCase().email('Enter your email address'),
  region: z.enum(regions, { message: 'Choose your region' }),
  password: z.string().min(8, 'Use at least 8 characters').max(200),
  website: z.string().optional(),
});

/**
 * Whether new engineers wait for an admin's approval. Off for now (Nov 2026): anyone with the invite link gets an
 * engineer account at once and the admins get a text saying who joined. ENGINEER_APPROVAL=on brings the approval back.
 */
const approvalOn = () => (process.env.ENGINEER_APPROVAL ?? '').trim().toLowerCase() === 'on';

/**
 * An engineer registers with the invite link (/engineer/join?code=…). Without approval (the default for now) the
 * account works straight away; with ENGINEER_APPROVAL=on it waits for an admin, who gets a text to approve it.
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
  if (await sharedLimited(`join:${ip}`, 10, 60 * 60_000)) return { errors: { form: 'Too many registrations from this connection. Please try again in an hour.' }, values };
  if (!appwrite) return { errors: { form: 'Registration isn’t open yet (the database isn’t connected). Please tell your manager.' }, values };
  const waiting = approvalOn();
  try {
    if (await accountExists(d.email)) return { errors: { email: 'There is already an account with this email. Sign in at the engineer portal instead.' }, values };
    const { salt, hash } = await hashPassword(d.password);
    await saveAccount({ id: `${waiting ? PENDING_PREFIX : ENGINEER_ID_PREFIX}${crypto.randomUUID().slice(0, 8)}`, name: d.name, email: d.email, organisation: engineerOrganisation(d.region), phone: showPhone(d.phone), salt, hash });
  } catch {
    return { errors: { form: 'We couldn’t save your registration. Check your connection and try again.' }, values };
  }
  const text = waiting
    ? `New engineer to approve: ${d.name} (${d.region}), ${d.phone}. Approve: ${siteUrl}/admin?tab=team`
    : `New engineer joined: ${d.name} (${d.region}), ${d.phone}. See or remove: ${siteUrl}/admin?tab=team`;
  await textAdmins('engineer-join', d.email, text).catch((e) => console.error('join: admin text failed', e));
  forgetTeam();
  revalidatePath('/admin');
  return { done: { name: d.name, waiting } };
}

/** Admin console → Engineers: approve a registration. The engineer gets a text with where to sign in. */
export async function approveEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  const who = await approve(String(form.get('id') ?? '')).catch((e) => (console.error('approve failed', e), null));
  if (who?.phone) await textPerson('engineer-approved', who.name, who.phone, `Hello ${who.name.split(' ')[0]}, your Flokefama engineer account is approved. Sign in: ${siteUrl}/engineer/login`).catch(() => {});
  revalidatePath('/admin');
}

/** Admin console → Engineers: make an engineer the head of engineering, or not. They get a text saying so. */
export async function setHeadEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  const on = form.get('on') === '1';
  const who = await setHead(String(form.get('id') ?? ''), on).catch((e) => (console.error('set head failed', e), null));
  // Tell them: the role changes what they can do and which texts they get
  if (who?.phone) {
    const first = who.name.split(' ')[0];
    const text = on
      ? `${first}, you are now Flokefama's head of engineering. You can give any job to any engineer, and you'll get texts about urgent jobs nobody has taken. ${siteUrl}/engineer`
      : `${first}, you are no longer Flokefama's head of engineering. Your engineer account is unchanged. ${siteUrl}/engineer`;
    await textPerson(on ? 'head-on' : 'head-off', who.name, who.phone, text).catch((e) => console.error('head: text failed', e));
  }
  revalidatePath('/admin');
}

/** Admin console → Engineers: decline a registration (deletes it). */
export async function declineEngineer(form: FormData) {
  const s = await getAdminSession();
  if (s?.role !== 'admin') return;
  await decline(String(form.get('id') ?? '')).catch((e) => console.error('decline failed', e));
  revalidatePath('/admin');
}
