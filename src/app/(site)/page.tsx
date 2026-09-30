import { BentoGrid } from '@/components/home/BentoGrid';
import { FinalCta } from '@/components/home/final-cta';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { PortalTeaser } from '@/components/home/portal-teaser';
import { ProductUniverse } from '@/components/home/product-universe';
import { Services } from '@/components/home/services';
import { SpecScrolly } from '@/components/home/spec-scrolly';
import { TrustBento } from '@/components/home/trust-bento';
import { getCategories, getMetrics, getMilestones, getProducts } from '@/lib/data';

export const revalidate = 600;

export default async function HomePage() {
  const [metrics, milestones, categories, products] = await Promise.all([getMetrics(), getMilestones(), getCategories(), getProducts()]);
  const flagship = products.find((p) => p.slug === 'mindray-bs-240') ?? products.find((p) => p.featured && p.image);

  return (
    <>
      <Hero />
      <Partners />
      <BentoGrid metrics={metrics} />
      {flagship && <SpecScrolly product={flagship} />}
      <ProductUniverse categories={categories} products={products} />
      <Services />
      <TrustBento milestones={milestones} />
      <PortalTeaser />
      <FinalCta />
    </>
  );
}
