'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { findSavedAccount, hashPassword, readAccounts, saveAccount } from '@/lib/auth/accounts';
import { nextFor, safeNext, SESSION_COOKIE, sessionCookie, signSession, type SessionUser } from '@/lib/auth/session';
import { demoCredentials, findAccount } from '@/lib/auth/users';

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
});

const signup = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name').max(100),
    organisation: z.string().trim().min(2, 'Enter your hospital, lab, clinic or company').max(120),
    phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters').max(200),
    confirm: z.string(),
    next: z.string().optional(),
    website: z.string().max(0).optional().or(z.literal('')), // honeypot
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords don’t match' });

async function startSession(user: Omit<SessionUser, 'exp'>, next: string | undefined) {
  (await cookies()).set(SESSION_COOKIE, await signSession(user), sessionCookie);
  redirect(nextFor(user.role, safeNext(next)));
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({ email: form.get('email'), password: form.get('password'), next: form.get('next') ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email: String(form.get('email') ?? '') };

  const demo = await findAccount(parsed.data.email, parsed.data.password);
  const saved = demo ? null : await findSavedAccount(parsed.data.email, parsed.data.password);
  // One generic message: never reveal whether the email or the password was wrong.
  if (!demo && !saved) return { error: 'That email and password don’t match an account.', email: parsed.data.email };

  const user = demo ?? { id: saved!.id, name: saved!.name, email: saved!.email, role: 'customer' as const, facility: saved!.organisation };
  await startSession({ sub: user.id, name: user.name, email: user.email, role: user.role, facility: user.facility, phone: saved?.phone }, parsed.data.next);
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
  const taken = demoCredentials.some((c) => c.email === d.email) || (await readAccounts()).some((a) => a.email === d.email);
  if (taken) return { errors: { email: 'There is already an account with this email. Sign in instead.' }, values };

  const { salt, hash } = await hashPassword(d.password);
  const id = `cus-${crypto.randomUUID().slice(0, 8)}`;
  await saveAccount({ id, name: d.name, email: d.email, organisation: d.organisation, phone: d.phone, salt, hash });
  await startSession({ sub: id, name: d.name, email: d.email, role: 'customer', facility: d.organisation, phone: d.phone }, d.next);
  return {};
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login?signedout=1');
}
