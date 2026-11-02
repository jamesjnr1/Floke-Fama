import type { Metadata } from 'next';
import { ClientShell } from '@/components/client/ClientShell';
import { PortalLogo } from '@/components/layout/logo';
import { introOn, introScriptFor } from '@/lib/intro';
import { SiteIntro } from '@/components/layout/site-intro';
import { catalogue } from '@/data/catalogue';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Flokefama Care: Hospital Dashboard',
  description: 'Request service, track engineers, and manage equipment and calibration certificates.',
  robots: { index: false },
};

export default async function ClientPortalPage() {
  const session = await requireSession('client', '/portal', { demo: true });
  // Only what the dashboard needs to turn purchases into equipment
  const products = catalogue.map(({ slug, name, brand, image, category, types }) => ({ slug, name, brand, image, category, types }));
  return (
    <>
      {/* The dashboard's opening: FLOKE FAMA CARE in the middle, rising into the sidebar (its own count, apart from the website's) */}
      {introOn && <script dangerouslySetInnerHTML={{ __html: introScriptFor('ff-intro-care') }} />}
      {introOn && <SiteIntro storageKey="ff-intro-care" target="aside [data-intro-target]" logo={<PortalLogo product="Care" className="[--s:1.25] sm:[--s:2.4] lg:[--s:3]" />} />}
      <ClientShell user={{ name: session.name, email: session.email, facility: session.facility, phone: session.phone }} products={products} demo={Boolean(session.demo)} />
    </>
  );
}
