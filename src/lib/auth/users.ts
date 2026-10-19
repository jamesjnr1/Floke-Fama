import 'server-only';
import type { Role } from '@/lib/auth/session';

/**
 * Who is staff. Everyone registers the same way (Register hospital); an account whose email is listed in
 * ADMIN_EMAILS signs in to the admin console (/admin), one listed in ENGINEER_EMAILS to the Biomedical Engineer
 * Service Portal (both comma-separated, set in Vercel). Everyone else is a hospital client.
 *
 * Emails are not verified, so register a staff member's account first and only then add the email to the list:
 * an email that already has an account can't be registered again by someone else.
 */
const list = (v: string | undefined) => new Set((v ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));
const admins = list(process.env.ADMIN_EMAILS);
const engineers = list(process.env.ENGINEER_EMAILS);

export const roleFor = (email: string): Role => {
  const e = email.trim().toLowerCase();
  return admins.has(e) ? 'admin' : engineers.has(e) ? 'engineer' : 'client';
};

