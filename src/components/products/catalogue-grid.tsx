import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { brochureUrl, categories as seedCategories } from '@/data/seed';
import { getCategories, getProducts } from '@/lib/data';

/**
 * The product catalogue on Products & Services (the CEO's review, point 1): every equipment category with a product
 * photo and its number of products, each opening the Shop filtered to that category.
 */
export async function CatalogueGrid() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const items = categories
    .map((c) => {
      const inCat = products.filter((p) => p.category === c.slug);
      const seed = seedCategories.find((s) => s.slug === c.slug);
      // A category's own photo; otherwise one of its products, except where no product photo stands for the whole
      // category (consumables: a lamp isn't “medical consumables”), which shows a placeholder until a photo is set
      const image = c.image ?? seed?.image ?? (seed?.noProductPhoto ? undefined : inCat[0]?.image);
      return { ...c, image, count: inCat.length };
    })
    .filter((c) => c.count > 0);

  return (
    <section id="catalogue" className="pattern-grid pattern-tr scroll-mt-28 border-t border-line bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)]">Product catalogue</h2>
            <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">Browse the equipment we supply, by category. Every system comes with installation, training and after-sales support.</p>
          </div>
          <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 shrink-0 items-center gap-2 border border-line px-5 font-semibold text-ink transition hover:border-ink/30">
            <Icon name="fi-rr-download" /> Download brochure (PDF)
          </a>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.slug}>
              <Link href={`/products?category=${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition hover:border-ink/20">
                <div className="relative aspect-[16/10] bg-[#F5F7F6]">
                  {c.image ? (
                    <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    // No photo yet (set one on the category in the Studio): a quiet placeholder
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="flex flex-col items-center gap-2 text-ink-3">
                        <ImageIcon className="size-10 opacity-50" strokeWidth={1.5} aria-hidden />
                        <span className="text-sm">Photo coming soon</span>
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink">{c.title}</h3>
                  <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{c.description}</p>
                  <p className="mt-auto flex items-center justify-between pt-5 text-[0.9375rem]">
                    <span className="text-ink-3">{c.count} {c.count === 1 ? 'product' : 'products'}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand-700">View products <Icon name="fi-rr-arrow-small-right" /></span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
