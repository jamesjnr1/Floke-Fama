import type { Metadata } from 'next';
import { EngineerProfile } from '@/components/engineer/profile';
import { requireSession } from '@/lib/auth/server';
import { findAccount } from '@/lib/auth/accounts';
import { regionOfOrganisation } from '@/lib/regions';

export const metadata: Metadata = { title: 'My profile', robots: { index: false } };

export default async function EngineerProfilePage() {
  const session = await requireSession('engineer', '/engineer/profile');
  const account = await findAccount(session.email).catch(() => null);
  return <EngineerProfile name={session.name} email={session.email} phone={account?.phone ?? session.phone ?? ''} region={regionOfOrganisation(account?.organisation) ?? ''} />;
}
