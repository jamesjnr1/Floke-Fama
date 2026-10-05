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
        image="/images/news/a-milestone-for-ghana-flokefama-sweeps-prestigious-mindray-ivd-awards-cover.webp"
        position="50% 45%"
        label="Awards"
        title={<>Recognitions that <span className="text-brand-600">reflect our impact</span></>}
        lead="Our commitment to excellence, innovation and service, recognized through prestigious awards and honors."
      />
      <AwardsGallery />
    </>
  );
}
