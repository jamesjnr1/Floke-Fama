import { HeroLogos } from '@/components/home/hero-logos';
import { AsymmetricHero, CenteredHero, GridHero, OverlayHero, SplitHero, StaggeredHero } from '@/components/home/hero-structures';

const heroes = { split: SplitHero, centered: CenteredHero, overlay: OverlayHero, grid: GridHero, asymmetric: AsymmetricHero, staggered: StaggeredHero };

export default async function HeroPreview({ searchParams }: { searchParams: Promise<{ v?: keyof typeof heroes }> }) {
  const { v } = await searchParams;
  const H = heroes[v ?? 'split'] ?? SplitHero;
  return (
    <>
      <H />
      <HeroLogos />
    </>
  );
}
