import 'server-only';
import type { Role } from '@/lib/auth/session';

/**
 * Account directory. DEMO ACCOUNTS ONLY: replace `findAccount` with a real identity provider
 * (e.g. Auth.js with hospital accounts from the CRM, Clerk, or Azure AD) before real data is connected.
 * Passwords are stored as SHA-256 hashes, never in plain text.
 * Disable the demo accounts entirely with ENABLE_DEMO_ACCOUNTS=false.
 */
interface Account {
  id: string;
  email: string;
  name: string;
  role: Role;
  facility?: string;
  passwordSha256: string;
}

export const demoAccountsEnabled = process.env.ENABLE_DEMO_ACCOUNTS !== 'false';

/** Shown on the login page while demo accounts are enabled. */
export const demoCredentials = [
  { role: 'client' as const, label: 'Hospital client', email: 'client@demo.flokefama.com', password: 'FlokeCare-2026' },
  { role: 'engineer' as const, label: 'Biomedical engineer', email: 'engineer@demo.flokefama.com', password: 'FlokeEng-2026' },
];

const accounts: Account[] = [
  {
    id: 'demo-client',
    email: 'client@demo.flokefama.com',
    name: 'Lab Administrator',
    role: 'client',
    facility: 'Demo Regional Hospital',
    passwordSha256: '17e03a017a431b669da7ed069ad45124e80539a2e7798b7d405e002c61717698',
  },
  {
    id: 'demo-engineer',
    email: 'engineer@demo.flokefama.com',
    name: 'Kwame Boateng',
    role: 'engineer',
    passwordSha256: '524fcfbf40e38e99df5099c344c45cdc7302292712d7c18deb0bbcf671e890a5',
  },
];

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison (avoids leaking how many characters matched). */
function timingSafeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function findAccount(email: string, password: string) {
  if (!demoAccountsEnabled) return null;
  const account = accounts.find((a) => a.email === email.trim().toLowerCase());
  const hash = await sha256Hex(password);
  // Always hash and compare, even for unknown emails, so response time doesn't reveal which emails exist.
  const ok = timingSafeEqual(hash, account?.passwordSha256 ?? '0'.repeat(64));
  if (!account || !ok) return null;
  return { id: account.id, email: account.email, name: account.name, role: account.role, facility: account.facility };
}
