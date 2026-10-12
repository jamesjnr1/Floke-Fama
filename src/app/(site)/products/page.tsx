import type { Metadata } from 'next';
import { BuyingFaq } from '@/components/products/buying-faq';
import { Catalog } from '@/components/products/catalog';
import { NewArrivals } from '@/components/products/new-arrivals';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { getCategories, getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Medical Equipment & Laboratory Catalogue',
  description: 'Search Flokefama’s catalogue of Mindray analysers, patient monitoring, laboratory equipment, hospital equipment and reagents, supplied and serviced across Ghana.',
  alternates: { canonical: '/products' },
};

// Pre-built and cached like the other pages (refreshed every 10 minutes and on Studio publish); the catalogue reads
// its filters from the address in the browser, so the page doesn't need rebuilding for every visit.
export const revalidate = 600;

/** What the grid and the search use, without the long descriptions, galleries and documents (a much lighter page). */
const forListing = (p: Product): Product => ({ ...p, description: undefined, gallery: undefined, documents: [], source: undefined });

export default async function ProductsPage() {
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  const products = all.map(forListing);
  // "Explore Product Categories": the original shop categories, with how many products each lists
  const types = new Map<string, number>();
  for (const p of products) for (const t of p.types ?? []) types.set(t, (types.get(t) ?? 0) + 1);
  const typeList = [...types].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="bg-canvas">
      <SitePageHero page="shop" vars={{ count: products.length }} />
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <NewArrivals products={products} categories={categories} />
        <div id="catalog" className="scroll-mt-24">
          <Catalog products={products} categories={categories} typeList={typeList} />
        </div>
        <BuyingFaq />
      </div>
    </div>
  );
}
