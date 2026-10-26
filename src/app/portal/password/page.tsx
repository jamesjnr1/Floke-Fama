import type { Metadata } from 'next';
import { ChangePassword } from '@/components/auth/change-password';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Change password', robots: { index: false } };

export default async function PortalPasswordPage() {
  const session = await requireSession('client', '/portal/password');
  return <ChangePassword email={session.email} back="/portal" backLabel="Back to your dashboard" />;
}
