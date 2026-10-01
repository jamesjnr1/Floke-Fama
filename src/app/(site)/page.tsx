import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { ProductUniverse } from '@/components/home/product-universe';
import { SpecScrolly } from '@/components/home/spec-scrolly';
import { Testimonials } from '@/components/home/testimonials';
import { getCategories, getProducts } from '@/lib/data';

export const revalidate = 600;

/** Home: each section appears only here; services, contact and company detail live on their own pages. */
export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <Hero />
      <Partners />
      <SpecScrolly />
      <ProductUniverse categories={categories} products={products} />
      <Testimonials />
    </>
  );
}
