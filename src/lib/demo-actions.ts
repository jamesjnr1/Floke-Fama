'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cookieFor, roleHome, sessionCookie, signSession } from '@/lib/auth/session';
import { demoUsers, type DemoRole } from '@/lib/demo';
import { isDemoCode } from '@/lib/demo-server';

/**
 * /demo: signs in to all three areas as their demo users (sample data only), so the walkthrough can move between
 * them, and opens the one chosen.
 */
export async function startDemo(form: FormData) {
  const role = String(form.get('role') ?? '') as DemoRole;
  if (!(role in demoUsers) || !isDemoCode(String(form.get('code') ?? ''))) redirect('/');
  const jar = await cookies();
  for (const r of Object.keys(demoUsers) as DemoRole[]) {
    const user = { ...demoUsers[r], demo: true, keep: true };
    jar.set(cookieFor(user.role), await signSession(user), sessionCookie(user));
  }
  redirect(roleHome[demoUsers[role].role]);
}
