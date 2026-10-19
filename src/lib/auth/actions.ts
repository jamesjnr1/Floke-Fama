'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AccountsUnavailable, accountExists, findSavedAccount, hashPassword, saveAccount, type StoredAccount } from '@/lib/auth/accounts';
import { nextFor, safeNext, SESSION_COOKIE, sessionCookie, signSession, type SessionUser } from '@/lib/auth/session';
import { isStaffEmail, roleFor, staffCodeOk } from '@/lib/auth/users';

export interface LoginState {
  error?: string;
  email?: string;
}

export interface SignupState {
  errors?: Partial<Record<'name' | 'organisation' | 'phone' | 'email' | 'password' | 'confirm' | 'staffCode' | 'form', string>>;
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
    staffCode: z.string().max(200).optional(),
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
  (await cookies()).set(SESSION_COOKIE, await signSession(user), sessionCookie(user));
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

  await startSession({ sub: saved.id, name: saved.name, email: saved.email, role: roleFor(saved.email), facility: saved.organisation, phone: saved.phone, keep: parsed.data.keep === 'on' }, parsed.data.next);
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
  // Staff emails (ADMIN_EMAILS, ENGINEER_EMAILS) get staff access, so registering one needs the staff code.
  if (isStaffEmail(d.email) && !staffCodeOk(d.staffCode ?? '')) {
    return { errors: { staffCode: 'This email is reserved for Flokefama staff. Enter your staff code.' }, values };
  }
  const taken = await guarded(() => accountExists(d.email));
  if (!taken.ok) return { errors: { form: UNAVAILABLE }, values };
  if (taken.value) return { errors: { email: 'There is already an account with this email. Sign in instead.' }, values };

  const { salt, hash } = await hashPassword(d.password);
  const id = `hos-${crypto.randomUUID().slice(0, 8)}`;
  const saved = await guarded(() => saveAccount({ id, name: d.name, email: d.email, organisation: d.organisation, phone: d.phone, salt, hash }));
  if (!saved.ok) return { errors: { form: UNAVAILABLE }, values };
  await startSession({ sub: id, name: d.name, email: d.email, role: roleFor(d.email), facility: d.organisation, phone: d.phone, keep: d.keep === 'on' }, d.next);
  return {};
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login?signedout=1');
}
