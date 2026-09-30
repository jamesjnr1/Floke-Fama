import type { Metadata } from 'next';
import { TrustBento } from '@/components/home/trust-bento';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { getMilestones } from '@/lib/data';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Media Hub',
  description: 'Awards, press features, partnerships and news from Flokefama, including the Mindray IVD awards and Forbes Africa.',
  alternates: { canonical: '/media' },
};

export default async function MediaPage() {
  const milestones = await getMilestones();
  return (
    <>
      <PageHero
        label="Media hub"
        title={<>Recognised at home. <span className="text-gradient">Awarded abroad.</span></>}
        lead="Awards, press features and partnerships that reflect our commitment to healthcare excellence."
      />
      <TrustBento milestones={milestones} heading={false} />
      <NewsGrid />
    </>
  );
}
