import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { LeadershipAwards } from '@/components/home/leadership-awards';
import { Partners } from '@/components/home/partners';
import { ProductUniverse } from '@/components/home/product-universe';
import { SpecScrolly } from '@/components/home/spec-scrolly';
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
      <Partners />
      <SpecScrolly />
      <ProductUniverse categories={categories} products={products} />
      <LeadershipAwards />
      <Testimonials />
    </>
  );
}
