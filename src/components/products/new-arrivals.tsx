import Link from 'next/link';
import { ProductVisual } from '@/components/products/product-visual';
import { Icon } from '@/components/ui/icon';
import type { Category, Product } from '@/lib/types';

/** “New arrivals”, as on the current flokefama.com homepage: shown at the top of the Shop. */
export function NewArrivals({ products, categories }: { products: Product[]; categories: Category[] }) {
  const items = products.filter((p) => p.newArrival).slice(0, 4);
  if (!items.length) return null;
  return (
    <section aria-labelledby="new-arrivals" className="pb-4">
      <div className="flex items-end justify-between gap-4">
        <h2 id="new-arrivals" className="flex items-center gap-2 text-xl font-semibold tracking-[-0.02em] text-ink">
          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-medium text-white">New</span> New arrivals
        </h2>
      </div>
      <ul className="swipe-row mt-4 gap-3 md:grid-cols-4">
        {items.map((p) => (
          <li key={p.slug} className="min-w-0">
            <Link href={`/products/${p.slug}`} scroll={false} className="group flex h-full items-center gap-3 rounded-3xl border border-line bg-paper p-2 pr-4 transition hover:border-ink/20 hover:shadow-[0_20px_40px_-30px_rgb(11_21_16/0.4)]">
              <ProductVisual product={p} category={categories.find((c) => c.slug === p.category)} shared={false} sizes="96px" className="size-20 shrink-0 rounded-2xl" />
              <span className="min-w-0 flex-1">
                <span className="label !font-sans block !text-[0.875rem]">{p.brand}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm font-semibold leading-snug text-ink">{p.name}</span>
              </span>
              <Icon name="fi-rr-arrow-small-right" className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
