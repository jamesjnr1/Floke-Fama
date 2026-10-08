import Image from 'next/image';
import Link from 'next/link';
import { AddToQuote } from '@/components/sales/add-to-quote';
import { Icon } from '@/components/ui/icon';
import type { Category, Product } from '@/lib/types';

/** Why buy from Flokefama: three short facts from the current Services page, linking to it. */
export function BuyAssurance() {
  const facts = [
    { icon: 'fi-rr-badge-check', text: 'Official distributor of Mindray, Biozek Holland and MR Global' },
    { icon: 'fi-rr-settings', text: 'Installation, calibration, training and maintenance' },
    { icon: 'fi-rr-marker', text: 'Branches in Accra, Kumasi, Aflao and Techiman' },
  ];
  return (
    <ul className="grid gap-2 rounded-3xl border border-line bg-paper p-4 sm:p-5">
      {facts.map((f) => (
        <li key={f.text} className="flex items-start gap-3 text-sm text-ink-2">
          <Icon name={f.icon} className="mt-0.5 shrink-0 text-brand-600" /> {f.text}
        </li>
      ))}
      <li className="pt-1 text-sm">
        <Link href="/services" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-600">How we support your equipment</Link>
      </li>
    </ul>
  );
}

/** Products that go with this one: same Shop type first, then the same category. */
export function relatedProducts(product: Product, all: Product[], n = 4) {
  const others = all.filter((p) => p.slug !== product.slug);
  const sameType = others.filter((p) => p.types?.some((t) => product.types?.includes(t)));
  const sameCategory = others.filter((p) => p.category === product.category && !sameType.includes(p));
  return [...sameType, ...sameCategory].slice(0, n);
}

export function RelatedProducts({ products, category }: { products: Product[]; category?: Category }) {
  if (!products.length) return null;
  return (
    <section className="border-t border-line bg-paper py-14 md:py-20" aria-labelledby="related-title">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="related-title" className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Often requested together</h2>
          {category && (
            <Link href={`/products?category=${category.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
              All {category.title}
            </Link>
          )}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.slug} className="relative">
              <AddToQuote item={{ slug: p.slug, name: p.name, brand: p.brand, image: p.image }} compact className="absolute right-3 top-3 z-10" />
              <Link href={`/products/${p.slug}`} className="group flex h-full flex-col rounded-3xl border border-line bg-canvas p-2 transition hover:border-transparent hover:shadow-[0_24px_50px_-28px_rgb(11_21_16/0.35)]">
                <span className="relative block aspect-square overflow-hidden rounded-md bg-white">
                  {p.image && <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-[14%] transition-transform duration-700 group-hover:scale-105" />}
                </span>
                <span className="px-2 pb-2 pt-3">
                  <span className="label block">{p.brand}</span>
                  <span className="mt-1 block text-sm font-semibold leading-snug text-ink">{p.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Phones: the main actions stay in reach while reading the spec sheet. */
export function MobileQuoteBar({ product }: { product: Product }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 py-3 pl-20 pr-4 backdrop-blur md:hidden">
      {/* pl-20 leaves room for the accessibility button bottom-left */}
      <div className="flex items-center gap-3">
        <AddToQuote item={{ slug: product.slug, name: product.name, brand: product.brand, image: product.image }} compact className="size-12 shrink-0 sm:size-12" />
        <Link href={`/quote?product=${product.slug}`} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-medium text-white">
          Order now
        </Link>
      </div>
    </div>
  );
}
