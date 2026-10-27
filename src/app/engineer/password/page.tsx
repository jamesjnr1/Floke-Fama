import type { Metadata } from 'next';
import { ChangePassword } from '@/components/auth/change-password';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Change password', robots: { index: false } };

export default async function EngineerPasswordPage() {
  const session = await requireSession('engineer', '/engineer/password');
  return <ChangePassword email={session.email} back="/engineer" backLabel="Back to the engineer portal" area="engineer" />;
}
