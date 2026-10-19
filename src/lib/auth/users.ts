import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import type { Role } from '@/lib/auth/session';

/**
 * Who is staff. Everyone registers the same way (Register hospital); an account whose email is listed in
 * ADMIN_EMAILS signs in to the admin console (/admin), one listed in ENGINEER_EMAILS to the Biomedical Engineer
 * Service Portal (both comma-separated, set in Vercel). Everyone else is a hospital client.
 *
 * Emails are not verified, so a staff email can only be registered with the staff code (STAFF_SIGNUP_CODE in
 * Vercel); otherwise anyone could register a staff member's address and get their access.
 */
const list = (v: string | undefined) => new Set((v ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));
const admins = list(process.env.ADMIN_EMAILS);
const engineers = list(process.env.ENGINEER_EMAILS);

export const roleFor = (email: string): Role => {
  const e = email.trim().toLowerCase();
  return admins.has(e) ? 'admin' : engineers.has(e) ? 'engineer' : 'client';
};

/** Whether this email is reserved for staff (registering it needs the staff code). */
export const isStaffEmail = (email: string) => roleFor(email) !== 'client';

/** Whether the staff code given at registration is right. No code set in Vercel: staff can't self-register. */
export function staffCodeOk(code: string | undefined) {
  const expected = process.env.STAFF_SIGNUP_CODE?.trim();
  if (!expected || !code) return false;
  const a = Buffer.from(code.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
