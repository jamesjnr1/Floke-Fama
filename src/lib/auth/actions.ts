'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AccountsUnavailable, accountExists, findAccount, findSavedAccount, hashPassword, saveAccount, type StoredAccount } from '@/lib/auth/accounts';
import { ADMIN_COOKIE, cookieFor, ENGINEER_COOKIE, nextFor, safeNext, SESSION_COOKIE, sessionCookie, signSession, type SessionUser } from '@/lib/auth/session';
import { getAdminSession, getEngineerSession, getSession } from '@/lib/auth/server';
import { roleFor } from '@/lib/auth/users';
import { appwrite } from '@/lib/appwrite';
import { updateEngineerPhone } from '@/lib/service/server';

export interface LoginState {
  error?: string;
  email?: string;
}

export interface SignupState {
  errors?: Partial<Record<'name' | 'organisation' | 'phone' | 'email' | 'password' | 'confirm' | 'form', string>>;
  values?: Record<string, string>;
}

const credentials = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password').max(200),
  next: z.string().optional(),
  keep: z.literal('on').optional(),
});

const signup = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(100),
    organisation: z.string().trim().min(2, 'Enter your hospital or facility name').max(120),
    phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters').max(200),
    confirm: z.string(),
    next: z.string().optional(),
    keep: z.literal('on').optional(),
    website: z.string().max(0).optional().or(z.literal('')), // honeypot
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' });

/** Shown instead of a crash when the accounts database can't be reached. */
const UNAVAILABLE = 'Our accounts service isn’t responding right now. Please try again in a few minutes, or call us on +233 53 339 2863.';

/** Runs an accounts lookup; a database failure becomes `unavailable` instead of an error page. */
async function guarded<T>(work: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    return { ok: true, value: await work() };
  } catch (err) {
    if (err instanceof AccountsUnavailable || (err as Error)?.name === 'AccountsUnavailable') return { ok: false };
    throw err;
  }
}

/** Failed sign-ins per IP and email in the last window (per server instance): slows down password guessing. */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

async function attemptKey(email: string) {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  return `${ip}|${email.toLowerCase()}`;
}

function blocked(key: string) {
  const a = attempts.get(key);
  if (!a) return false;
  if (Date.now() - a.first > WINDOW) {
    attempts.delete(key);
    return false;
  }
  return a.count >= MAX_ATTEMPTS;
}

function failed(key: string) {
  const a = attempts.get(key);
  if (!a || Date.now() - a.first > WINDOW) attempts.set(key, { count: 1, first: Date.now() });
  else a.count += 1;
  if (attempts.size > 5000) attempts.delete(attempts.keys().next().value!);
}

async function startSession(user: Omit<SessionUser, 'exp'>, next: string | undefined) {
  // Each role has its own session: hospitals on the site, engineers and admins only in their own areas
  (await cookies()).set(cookieFor(user.role), await signSession(user), sessionCookie(user));
  redirect(nextFor(user.role, safeNext(next)));
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({ email: form.get('email'), password: form.get('password'), next: form.get('next') ?? undefined, keep: form.get('keep') ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email: String(form.get('email') ?? '') };

  const key = await attemptKey(parsed.data.email);
  if (blocked(key)) return { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.', email: parsed.data.email };
  const found = await guarded(() => findSavedAccount(parsed.data.email, parsed.data.password));
  if (!found.ok) return { error: UNAVAILABLE, email: parsed.data.email };
  const saved: StoredAccount | null = found.value;
  // One generic message: never reveal whether the email or the password was wrong.
  if (!saved) {
    failed(key);
    return { error: 'That email and password don’t match an account.', email: parsed.data.email };
  }
  attempts.delete(key);
  // The admin and engineer sign-in pages (/admin/login, /engineer/login) only let their own role in
  const role = roleFor(saved.email, saved.id);
  if (form.get('area') === 'admin' && role !== 'admin') return { error: 'This account doesn’t have access to the admin console.', email: parsed.data.email };
  if (form.get('area') === 'engineer' && role !== 'engineer') return { error: 'This sign-in is for Flokefama engineers. Hospitals sign in to the client portal at /login.', email: parsed.data.email };
  // The site's sign-in (/login) is for hospitals only
  if (!form.get('area') && role === 'engineer') return { error: 'This sign-in is for hospitals. Engineers sign in to the engineer portal at /engineer/login.', email: parsed.data.email };
  if (!form.get('area') && role === 'admin') return { error: 'This sign-in is for hospitals. Admins sign in to the admin console at /admin/login.', email: parsed.data.email };

  await startSession({ sub: saved.id, name: saved.name, email: saved.email, role: roleFor(saved.email, saved.id), facility: saved.organisation, phone: saved.phone, keep: parsed.data.keep === 'on' }, parsed.data.next);
  return {};
}

export async function register(_prev: SignupState, form: FormData): Promise<SignupState> {
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const parsed = signup.safeParse(raw);
  const values = { name: raw.name ?? '', organisation: raw.organisation ?? '', phone: raw.phone ?? '', email: raw.email ?? '' };
  if (!parsed.success) {
    const errors: SignupState['errors'] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof NonNullable<SignupState['errors']>] ??= issue.message;
    return { errors, values };
  }
  const d = parsed.data;
  if (d.website) return {};
  const taken = await guarded(() => accountExists(d.email));
  if (!taken.ok) return { errors: { form: UNAVAILABLE }, values };
  if (taken.value) return { errors: { email: 'There is already an account with this email. Sign in instead.' }, values };

  const { salt, hash } = await hashPassword(d.password);
  const id = `hos-${crypto.randomUUID().slice(0, 8)}`;
  const saved = await guarded(() => saveAccount({ id, name: d.name, email: d.email, organisation: d.organisation, phone: d.phone, salt, hash }));
  if (!saved.ok) return { errors: { form: UNAVAILABLE }, values };
  await startSession({ sub: id, name: d.name, email: d.email, role: roleFor(d.email, id), facility: d.organisation, phone: d.phone, keep: d.keep === 'on' }, d.next);
  return {};
}

/** Signing out of the site (a hospital) returns to its sign-in page. */
export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login?signedout=1');
}

/** Signing out of the engineer portal returns to its own sign-in page; a hospital session on the site is untouched. */
export async function engineerLogout() {
  (await cookies()).delete(ENGINEER_COOKIE);
  redirect('/engineer/login?signedout=1');
}

/** Signing out of the admin console returns to its own sign-in page. */
export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login?signedout=1');
}

export interface PasswordState {
  errors?: Partial<Record<'current' | 'password' | 'confirm' | 'form', string>>;
  done?: boolean;
}

const newPassword = z
  .object({
    current: z.string().min(1, 'Enter your current password').max(200),
    password: z.string().min(8, 'Use at least 8 characters').max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' })
  .refine((v) => v.password !== v.current, { path: ['password'], message: 'Choose a password different from the current one' });

/**
 * Change password, for any signed-in account (hospital, engineer or admin): checks the current password, then saves
 * the new one. Wrong current passwords count towards the same lock-out as sign-in.
 */
export async function changePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const area = form.get('area');
  const session = area === 'admin' ? await getAdminSession() : area === 'engineer' ? await getEngineerSession() : await getSession();
  if (!session) return { errors: { form: 'Your session has ended. Please sign in again.' } };
  const parsed = newPassword.safeParse({ current: form.get('current'), password: form.get('password'), confirm: form.get('confirm') });
  if (!parsed.success) {
    const errors: PasswordState['errors'] = {};
    for (const issue of parsed.error.issues) errors[issue.path[0] as keyof NonNullable<PasswordState['errors']>] ??= issue.message;
    return { errors };
  }
  const key = await attemptKey(session.email);
  if (blocked(key)) return { errors: { form: 'Too many attempts. Please wait 15 minutes and try again.' } };
  const found = await guarded(() => findSavedAccount(session.email, parsed.data.current));
  if (!found.ok) return { errors: { form: UNAVAILABLE } };
  if (!found.value) {
    failed(key);
    return { errors: { current: 'That isn’t your current password.' } };
  }
  attempts.delete(key);
  const { salt, hash } = await hashPassword(parsed.data.password);
  const saved = await guarded(() => saveAccount({ ...found.value!, salt, hash }));
  if (!saved.ok) return { errors: { form: UNAVAILABLE } };
  return { done: true };
}

export interface ProfileState {
  errors?: Partial<Record<'phone' | 'form', string>>;
  done?: boolean;
  phone?: string;
}

/**
 * The engineer portal's My profile: the engineer changes their own phone number. It is saved on their account
 * (texts go to it), their session picks it up straight away, and the hospitals on their open jobs see the new one.
 */
export async function updateProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const s = await getEngineerSession();
  if (!s) return { errors: { form: 'Your session has ended. Please sign in again.' } };
  const phone = String(form.get('phone') ?? '').trim().replace(/\s+/g, ' ');
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone) || phone.length > 30) return { phone, errors: { phone: 'Enter a valid phone number, e.g. 024 123 4567.' } };
  const account = await guarded(() => findAccount(s.email));
  if (!account.ok) return { phone, errors: { form: UNAVAILABLE } };
  if (!account.value) return { phone, errors: { form: 'Your account could not be found. Please sign in again.' } };
  const saved = await guarded(() => saveAccount({ ...account.value!, phone }));
  if (!saved.ok) return { phone, errors: { form: UNAVAILABLE } };
  const { exp: _exp, ...user } = s;
  void _exp;
  (await cookies()).set(ENGINEER_COOKIE, await signSession({ ...user, phone }), sessionCookie(user));
  if (appwrite) await updateEngineerPhone(s.name, phone).catch((e) => console.error('[profile] open jobs not updated', e));
  return { done: true, phone };
}
