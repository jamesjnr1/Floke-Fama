import type { Metadata } from 'next';
import { AwardsGallery } from '@/components/awards/awards-gallery';
import { SitePageHero } from '@/components/layout/site-page-hero';

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Ranked No.1 in the Healthcare sector at the Ghana Club 100 Awards, Mindray Market Breakthrough and Best in IVD, and more.',
  alternates: { canonical: '/awards' },
};

export default function AwardsPage() {
  return (
    <>
      <SitePageHero page="awards" />
      <AwardsGallery />
    </>
  );
}
