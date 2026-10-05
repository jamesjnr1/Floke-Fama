import type { Metadata } from 'next';
import { ClientShell } from '@/components/client/ClientShell';
import { catalogue } from '@/data/catalogue';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Flokefama Care: Hospital Dashboard',
  description: 'Request service, track engineers, and manage equipment and calibration certificates.',
  robots: { index: false },
};

export default async function ClientPortalPage() {
  const session = await requireSession('client', '/portal');
  // Only what the dashboard needs to turn purchases into equipment
  const products = catalogue.map(({ slug, name, brand, image, category }) => ({ slug, name, brand, image, category }));
  return <ClientShell user={{ name: session.name, email: session.email, facility: session.facility }} products={products} />;
}
