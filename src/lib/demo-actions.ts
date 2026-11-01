'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cookieFor, roleHome, sessionCookie, signSession } from '@/lib/auth/session';
import { demoUsers, type DemoRole } from '@/lib/demo';
import { isDemoCode } from '@/lib/demo-server';

/** /demo: opens one of the three areas as its demo user (sample data only). */
export async function startDemo(form: FormData) {
  const role = String(form.get('role') ?? '') as DemoRole;
  if (!(role in demoUsers) || !isDemoCode(String(form.get('code') ?? ''))) redirect('/');
  const user = { ...demoUsers[role], demo: true, keep: true };
  (await cookies()).set(cookieFor(user.role), await signSession(user), sessionCookie(user));
  redirect(roleHome[user.role]);
}
