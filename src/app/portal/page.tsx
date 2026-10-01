import type { Metadata } from 'next';
import { ClientShell } from '@/components/client/ClientShell';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Flokefama Care: Client Portal',
  description: 'Request service, track engineers, and manage equipment and calibration certificates.',
  robots: { index: false },
};

export default async function ClientPortalPage() {
  const session = await requireSession('client', '/portal');
  return <ClientShell user={{ name: session.name, email: session.email, facility: session.facility }} />;
}
