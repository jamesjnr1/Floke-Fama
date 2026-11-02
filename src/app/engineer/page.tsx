import type { Metadata } from 'next';
import { PortalShell } from '@/components/engineer/PortalShell';
import { PortalLogo } from '@/components/layout/logo';
import { introOn, introScriptFor } from '@/lib/intro';
import { SiteIntro } from '@/components/layout/site-intro';
import { catalogue } from '@/data/catalogue';
import { requireSession } from '@/lib/auth/server';
import { CONSUMABLES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Biomedical Engineer Service Portal',
  description: 'Track service tickets, engineer dispatch, system status and calibration records for every installed system.',
  robots: { index: false },
  manifest: '/manifest-service.webmanifest',
  appleWebApp: { capable: true, title: 'FF Service', statusBarStyle: 'black-translucent' },
};

export default async function EngineerPortalPage() {
  const session = await requireSession('engineer', '/engineer', { demo: true });
  // For registering existing equipment: catalogue items take their photo and documents along
  const products = catalogue.filter((p) => p.category !== CONSUMABLES).map(({ slug, name, brand, image }) => ({ slug, name, brand, image }));
  return (
    <>
      {/* The dashboard's opening: FLOKE FAMA SERVICE in the middle, rising into the sidebar (its own count) */}
      {introOn && <script dangerouslySetInnerHTML={{ __html: introScriptFor('ff-intro-service') }} />}
      {introOn && <SiteIntro storageKey="ff-intro-service" target="aside [data-intro-target]" logo={<PortalLogo product="Service" className="[--s:1.25] sm:[--s:2.4] lg:[--s:3]" />} />}
      <PortalShell user={{ name: session.name, email: session.email }} products={products} demo={Boolean(session.demo)} />
    </>
  );
}
