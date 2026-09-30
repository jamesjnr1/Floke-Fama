import type { Metadata } from 'next';
import { PortalShell } from '@/components/portal/PortalShell';

export const metadata: Metadata = {
  title: 'Biomedical Engineer Service Portal',
  description: 'Track service tickets, engineer dispatch, system status and calibration records for every installed system.',
  robots: { index: false },
};

export default function PortalPage() {
  return <PortalShell />;
}
