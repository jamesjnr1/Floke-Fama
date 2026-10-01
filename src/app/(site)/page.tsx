import { VisitUs } from '@/components/contact/visit-us';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { ProductUniverse } from '@/components/home/product-universe';
import { Services } from '@/components/home/services';
import { SpecScrolly } from '@/components/home/spec-scrolly';
import { Testimonials } from '@/components/home/testimonials';
import { getCategories, getProducts } from '@/lib/data';

export const revalidate = 600;

/** Home: the approved sections, plus testimonials and the head office. "Get in touch" lives in the footer. */
export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <Hero />
      <Partners />
      <SpecScrolly />
      <ProductUniverse categories={categories} products={products} />
      <Services />
      <Testimonials />
      <VisitUs />
    </>
  );
}
