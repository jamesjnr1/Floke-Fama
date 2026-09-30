import { GetInTouch } from '@/components/contact/get-in-touch';
import { VisitUs } from '@/components/contact/visit-us';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { ProductUniverse } from '@/components/home/product-universe';
import { Services } from '@/components/home/services';
import { SpecScrolly } from '@/components/home/spec-scrolly';
import { Testimonials } from '@/components/home/testimonials';
import { getCategories, getProducts } from '@/lib/data';

export const revalidate = 600;

/** Home: the approved sections, plus testimonials, the head office and get in touch, as on flokefama.com. */
export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const flagship = products.find((p) => p.slug === 'mindray-bs-240') ?? products.find((p) => p.featured && p.image);

  return (
    <>
      <Hero />
      <Partners />
      {flagship && <SpecScrolly product={flagship} />}
      <ProductUniverse categories={categories} products={products} />
      <Services />
      <Testimonials />
      <VisitUs />
      <GetInTouch />
    </>
  );
}
