import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';

export const metadata: Metadata = { title: 'Hero preview', robots: { index: false } };

/** Temporary: compare hero 3D options (?v=capsule | globe, &figures=1 to show the figure cards). */
export default async function HeroPreview({ searchParams }: { searchParams: Promise<{ v?: string; figures?: string }> }) {
  const { v, figures } = await searchParams;
  const visual = v === 'globe' ? 'globe' : 'capsule';
  return <Hero visual={visual} figures={figures === '1'} />;
}
