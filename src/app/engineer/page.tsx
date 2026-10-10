import type { Metadata } from 'next';
import { PortalShell } from '@/components/engineer/PortalShell';
import { requireSession } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Biomedical Engineer Service Portal',
  description: 'Track service tickets, engineer dispatch, system status and calibration records for every installed system.',
  robots: { index: false },
  manifest: '/manifest-service.webmanifest',
  appleWebApp: { capable: true, title: 'FF Service', statusBarStyle: 'black-translucent' },
  icons: { icon: '/images/favicon.png', apple: '/images/apple-touch-icon.png' },
};

export default async function EngineerPortalPage() {
  const session = await requireSession('engineer', '/engineer');
  return <PortalShell user={{ name: session.name, email: session.email }} />;
}
