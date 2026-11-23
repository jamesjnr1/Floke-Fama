'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { dismissError } from '@/lib/monitor';
import { isOwner, keyMatches, markMine, ownerConfigured, signInOwner, signOutOwner } from '@/lib/owner/auth';
import { clearAttempts, overLimit, recordAttempt } from '@/lib/shared-limit';

export type UnlockState = { error?: string; done?: boolean };

/** Opens the dashboard with the manager's key: five wrong tries from one connection lock it for 15 minutes. */
export async function unlock(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  if (!ownerConfigured()) return { error: 'The dashboard has not been switched on yet (MONITOR_KEY is not set in Vercel).' };
  const ip = ((await headers()).get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const limit = `owner:${ip}`;
  if (await overLimit(limit, 5, 15 * 60_000)) return { error: 'Too many wrong tries. Wait 15 minutes and try again.' };
  if (!keyMatches(String(form.get('key') ?? ''))) {
    await recordAttempt(limit, 15 * 60_000);
    return { error: 'That key is not right.' };
  }
  await clearAttempts(limit);
  await signInOwner();
  redirect('/monitor');
}

/**
 * On a phone (where the dashboard doesn't open): the manager's key marks the phone as theirs, so their own visits
 * from it are left out of the monitor. The same five-tries limit as opening the dashboard.
 */
export async function markPhone(_prev: UnlockState, form: FormData): Promise<UnlockState> {
  if (!ownerConfigured()) return { error: 'The site monitor has not been switched on yet.' };
  const ip = ((await headers()).get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const limit = `owner:${ip}`;
  if (await overLimit(limit, 5, 15 * 60_000)) return { error: 'Too many wrong tries. Wait 15 minutes and try again.' };
  if (!keyMatches(String(form.get('key') ?? ''))) {
    await recordAttempt(limit, 15 * 60_000);
    return { error: 'That key is not right.' };
  }
  await clearAttempts(limit);
  await markMine();
  return { done: true };
}

export async function lock() {
  await signOutOwner();
  redirect('/monitor');
}

/** Clears an error from the list once it is dealt with (it comes back if it happens again). */
export async function clearError(id: string) {
  if (!(await isOwner())) return { ok: false };
  await dismissError(id);
  return { ok: true };
}
