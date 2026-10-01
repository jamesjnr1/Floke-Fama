import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';

export const metadata: Metadata = { title: 'Hero preview', robots: { index: false } };

/** Temporary: compare hero 3D options (?v=equipment | capsules | molecule | globe). */
export default async function HeroPreview({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  const visual = v === 'molecule' || v === 'globe' || v === 'capsules' ? v : 'equipment';
  return <Hero visual={visual} />;
}
