import type { Metadata } from 'next';
import { Catalog } from '@/components/products/catalog';
import { NewArrivals } from '@/components/products/new-arrivals';
import { getCategories, getProducts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Medical Equipment & Laboratory Catalogue',
  description: 'Search Flokefama’s catalogue of Mindray analysers, patient monitoring, laboratory equipment, hospital equipment and reagents, supplied and serviced across Ghana.',
  alternates: { canonical: '/products' },
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const [{ category, q }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  const initialCategory = categories.some((c) => c.slug === category) ? category! : null;

  return (
    <div className="bg-canvas pt-20">
      <section className="relative overflow-hidden">
        <div className="grid-fade-light absolute inset-0" />
        <div className="relative mx-auto max-w-[1280px] px-5 pb-10 pt-16 md:px-10 md:pt-24">
          <p className="label">Product universe</p>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.75rem,1.4rem+5vw,6rem)]">
            Clinical-grade equipment. <span className="text-brand-600">Instantly searchable.</span>
          </h1>
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <NewArrivals products={products} categories={categories} />
        <Catalog products={products} categories={categories} initialCategory={initialCategory} initialQuery={q ?? ''} />
      </div>
    </div>
  );
}
