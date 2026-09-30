import type { Metadata } from 'next';
import Link from 'next/link';
import { FinalCta } from '@/components/home/final-cta';
import { ProductUniverse } from '@/components/home/product-universe';
import { Services } from '@/components/home/services';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { getCategories, getProducts } from '@/lib/data';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'In-vitro diagnostics, patient monitoring, laboratory and hospital equipment, and consumables, with installation, calibration, maintenance and training.',
  alternates: { canonical: '/solutions' },
};

export default async function SolutionsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <PageHero
        label="Solutions"
        title={<>Integrated solutions, <span className="text-gradient">end to end</span></>}
        lead="From the first consultation to years of after-sales care: equipment, reagents and the engineers who keep them running."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="glow" size="lg">
            <Link href="/products">Browse the catalogue <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/quote">Request a quote</Link>
          </Button>
        </div>
      </PageHero>
      <ProductUniverse categories={categories} products={products} />
      <Services />
      <FinalCta />
    </>
  );
}
