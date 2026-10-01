import type { Metadata } from 'next';
import { AwardsGallery } from '@/components/awards/awards-gallery';
import { PageHero } from '@/components/layout/page-hero';

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Ranked No.1 in the Healthcare sector at the Ghana Club 100 Awards, Mindray Market Breakthrough and Best in IVD, and more.',
  alternates: { canonical: '/awards' },
};

export default function AwardsPage() {
  return (
    <>
      <PageHero
        label="Awards"
        title={<>Recognitions that <span className="text-gradient">reflect our impact</span></>}
        lead="Our commitment to excellence, innovation and service has earned the trust of countless healthcare institutions, and prestigious awards and honours along the way."
      />
      <AwardsGallery />
    </>
  );
}
