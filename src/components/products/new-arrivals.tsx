import Link from 'next/link';
import { ProductVisual } from '@/components/products/product-visual';
import { AddToQuote } from '@/components/sales/add-to-quote';
import type { Category, Product } from '@/lib/types';

/** “New arrivals”, as on the current flokefama.com homepage: four large cards at the top of the Shop. */
export function NewArrivals({ products, categories }: { products: Product[]; categories: Category[] }) {
  const items = products.filter((p) => p.newArrival).slice(0, 4);
  if (!items.length) return null;
  return (
    <section aria-labelledby="new-arrivals" className="py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="new-arrivals" className="display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)]">New arrivals</h2>
          <p className="mt-2 text-ink-3">The latest equipment in the Flokefama catalogue.</p>
        </div>
      </div>
      <ul className="swipe-row mt-8 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => {
          const category = categories.find((c) => c.slug === p.category);
          return (
            <li key={p.slug} className="relative min-w-0">
              <AddToQuote item={{ slug: p.slug, name: p.name, brand: p.brand, image: p.image }} compact className="absolute right-4 top-4 z-10" />
              <Link
                href={`/products/${p.slug}`}
                scroll={false}
                className="group flex h-full flex-col overflow-hidden border border-line bg-paper transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]"
              >
                <div className="relative">
                  <ProductVisual product={p} category={category} shared={false} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 84vw" className="aspect-[4/3.2]" />
                  <span className="absolute left-4 top-4 rounded-full bg-signal px-3 py-1 text-xs font-semibold text-white">New</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm font-semibold text-brand-700">
                    {p.brand}
                    {category && <span className="font-normal text-ink-3"> · {category.short}</span>}
                  </p>
                  <h3 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-ink">{p.name}</h3>
                  <span className="mt-auto pt-4 text-sm font-semibold text-brand-700 underline-offset-4 group-hover:underline">View product</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
