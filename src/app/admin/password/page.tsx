import type { Metadata } from 'next';
import { ChangePassword } from '@/components/auth/change-password';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Change password', robots: { index: false } };

export default async function AdminPasswordPage() {
  const session = await requireSession('admin', '/admin/password');
  return <ChangePassword email={session.email} back="/admin" backLabel="Back to the admin console" area="admin" />;
}
