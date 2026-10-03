import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { ProductUniverse } from '@/components/home/product-universe';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import { BeyondSupply } from '@/components/home/beyond-supply';
import { Testimonials } from '@/components/home/testimonials';
import { getCategories, getProducts } from '@/lib/data';

export const revalidate = 600;

export const metadata: Metadata = { alternates: { canonical: '/' } };

/** Home: each section appears only here; services, contact and company detail live on their own pages. */
export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <Hero />
      <Partners heading={false} logos={false} />
      <BeyondSupply />
      <section aria-label="Our mission, vision and aim" className="bg-canvas py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <PurposeBlocks />
        </div>
      </section>
      <ProductUniverse categories={categories} products={products} />
      <Testimonials />
    </>
  );
}
