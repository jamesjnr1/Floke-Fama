'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { roleHome, safeNext, SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from '@/lib/auth/session';
import { findAccount } from '@/lib/auth/users';

export interface LoginState {
  error?: string;
  email?: string;
}

const credentials = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password').max(200),
  next: z.string().optional(),
});

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({ email: form.get('email'), password: form.get('password'), next: form.get('next') ?? undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, email: String(form.get('email') ?? '') };

  const account = await findAccount(parsed.data.email, parsed.data.password);
  // One generic message: never reveal whether the email or the password was wrong.
  if (!account) return { error: 'That email and password don’t match an account.', email: parsed.data.email };

  const token = await signSession({ sub: account.id, name: account.name, email: account.email, role: account.role, facility: account.facility });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  // Honour ?next= only if it points inside the account's own area.
  const next = safeNext(parsed.data.next);
  const home = roleHome[account.role];
  redirect(next && next.startsWith(home) ? next : home);
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login?signedout=1');
}
