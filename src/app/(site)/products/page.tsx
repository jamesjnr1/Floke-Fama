import type { Metadata } from 'next';
import Link from 'next/link';
import { BuyingFaq } from '@/components/products/buying-faq';
import { Catalog } from '@/components/products/catalog';
import { NewArrivals } from '@/components/products/new-arrivals';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { getCategories, getProducts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Medical Equipment & Laboratory Catalogue',
  description: 'Search Flokefama’s catalogue of Mindray analysers, patient monitoring, laboratory equipment, hospital equipment and reagents, supplied and serviced across Ghana.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; type?: string }> }) {
  const [{ category, q, type }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  const initialCategory = categories.some((c) => c.slug === category) ? category! : null;
  // "Explore Product Categories": the original shop categories, with how many products each lists
  const types = new Map<string, number>();
  for (const p of products) for (const t of p.types ?? []) types.set(t, (types.get(t) ?? 0) + 1);
  const typeList = [...types].sort((a, b) => a[0].localeCompare(b[0]));
  const initialType = type && types.has(type) ? type : null;

  return (
    <div className="bg-canvas">
      <SitePageHero page="shop" vars={{ count: products.length }} />
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <NewArrivals products={products} categories={categories} />
        <div id="catalog" className="scroll-mt-24">
          <Catalog key={`${initialCategory}|${q ?? ''}|${initialType}`} products={products} categories={categories} initialCategory={initialCategory} initialQuery={q ?? ''} initialType={initialType} />
        </div>

        <section aria-labelledby="explore-categories" className="border-t border-line pb-12 pt-12 md:pb-16">
          <h2 id="explore-categories" className="text-2xl font-bold tracking-[-0.02em] text-ink">Explore Product Categories</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {typeList.map(([t, n]) => (
              <li key={t}>
                <Link
                  href={`/products?type=${encodeURIComponent(t)}#catalog`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>{t}</span>
                  <span className="shrink-0 text-xs text-ink-3">{n} {n === 1 ? 'product' : 'products'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <BuyingFaq />
      </div>
    </div>
  );
}
