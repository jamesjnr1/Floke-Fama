import type { Metadata } from 'next';
import { AwardsGallery } from '@/components/awards/awards-gallery';
import { StoryPanels } from '@/components/layout/story-panels';

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Ranked No.1 in the Healthcare sector at the Ghana Club 100 Awards, Mindray Market Breakthrough and Best in IVD, and more.',
  alternates: { canonical: '/awards' },
};

export default function AwardsPage() {
  return (
    <>
      <StoryPanels
        label="Awards"
        title={<>Recognitions that <span className="text-brand-600">reflect our impact</span></>}
        lead="Our commitment to excellence, innovation and service, recognized through prestigious awards and honors."
        panels={[{ kind: 'colour', tone: 'red', title: 'Ranked No.1 in the healthcare sector.', text: 'First among healthcare companies at the 21st Ghana Club 100 Awards.' }]}
      />
      <AwardsGallery />
    </>
  );
}
