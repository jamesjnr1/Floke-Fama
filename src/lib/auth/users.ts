import 'server-only';
import type { Role } from '@/lib/auth/session';

/**
 * Who is an engineer. Everyone registers the same way (Register hospital); an account whose email is listed in
 * ENGINEER_EMAILS (comma-separated, set in Vercel) signs in to the Biomedical Engineer Service Portal instead of
 * the hospital dashboard. Everyone else is a hospital client.
 */
const engineers = new Set(
  (process.env.ENGINEER_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export const roleFor = (email: string): Role => (engineers.has(email.trim().toLowerCase()) ? 'engineer' : 'client');
