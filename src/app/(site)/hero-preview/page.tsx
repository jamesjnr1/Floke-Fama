import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';

export const metadata: Metadata = { title: 'Hero preview', robots: { index: false } };

/** Temporary: compare hero 3D options (?v=capsules | molecule | globe). */
export default async function HeroPreview({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  const visual = v === 'molecule' ? 'molecule' : v === 'globe' ? 'globe' : 'capsules';
  return <Hero visual={visual} />;
}
