import type { Metadata } from 'next';
import { EngineerProfile } from '@/components/engineer/profile';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'My profile', robots: { index: false } };

export default async function EngineerProfilePage() {
  const session = await requireSession('engineer', '/engineer/profile');
  return <EngineerProfile name={session.name} email={session.email} phone={session.phone ?? ''} />;
}
