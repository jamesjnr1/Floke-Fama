'use client';

import Link from 'next/link';
import { helpHref } from '@/lib/links';
import { useRouter } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductVisual } from '@/components/products/product-visual';
import { AddToQuote } from '@/components/sales/add-to-quote';
import { Icon } from '@/components/ui/icon';
import { localSearch, searchProducts, searchProvider } from '@/lib/search';
import type { Category, Product } from '@/lib/types';
import { legacyCategoryLink } from '@/lib/categories';
import { cn } from '@/lib/utils';

/**
 * Interactive B2B catalogue: category switching and keystroke search morph the grid in place
 * (no reloads). State is mirrored to the URL so every view is shareable. The Shop page is pre-built and cached,
 * so the starting filters (?category, ?q, ?type) are read from the address in the browser.
 */
export function Catalog({ products, categories, typeList }: {
  products: Product[];
  categories: Category[];
  /** The original flokefama.com shop categories ("Hematology Analyzers") with their product counts, for ?type= */
  typeList: [string, number][];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [remote, setRemote] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const catBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);

  // Local search is synchronous; Algolia results arrive asynchronously.
  const localResults = useMemo(() => localSearch(query || ' ', category, products), [query, category, products]);
  const visibleSlugs = searchProvider === 'algolia' && query.trim() ? remote ?? [] : query.trim() ? localResults : products.filter((p) => !category || p.category === category).map((p) => p.slug);
  const visible = visibleSlugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p) && (!type || Boolean(p?.types?.includes(type))));

  useEffect(() => {
    if (searchProvider !== 'algolia' || !query.trim()) return;
    const t = setTimeout(() => searchProducts(query, category, products).then(setRemote).catch(() => setRemote(localResults)), 120);
    return () => clearTimeout(t);
  }, [query, category, products, localResults]);

  // Starting filters from the address (?category, ?q, ?type)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = legacyCategoryLink(sp.get('category') ?? '');
    const t = sp.get('type');
    if (c && catBySlug.has(c)) setCategory(c);
    if (sp.get('q')) setQuery(sp.get('q')!);
    if (t && typeList.some(([x]) => x === t)) setType(t);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  // Mirror state to the URL without a navigation (after the starting filters are read).
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query.trim()) params.set('q', query.trim());
    if (type) params.set('type', type);
    const next = `/products${params.size ? `?${params}` : ''}`;
    if (next !== `${location.pathname}${location.search}`) window.history.replaceState(null, '', next);
  }, [ready, category, query, type]);

  // "Explore Product Categories": filter in place and go back up to the grid
  const pickType = (t: string) => {
    setType(t);
    setCategory(null);
    setQuery('');
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // "/" or ⌘K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The categories' full names (the CEO's five), as the tabs scroll sideways when they don't fit
  const tabs = [{ slug: null, title: 'All equipment' }, ...categories.map((c) => ({ slug: c.slug, title: c.title }))];

  return (
    <LayoutGroup>
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-canvas px-5 py-4 md:-mx-10 md:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Categories" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {tabs.map((t) => {
              const active = category === t.slug;
              return (
                <button
                  key={t.title}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(t.slug)}
                  className={cn('relative shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors', active ? 'text-white' : 'text-ink-3 hover:text-ink')}
                >
                  {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-md bg-midnight" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
                  <span className="relative">{t.title}</span>
                </button>
              );
            })}
          </div>
          <label className="group relative flex h-12 w-full items-center rounded-lg border border-line bg-paper pl-12 pr-4 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 lg:w-96">
            <Icon name="fi-rr-search" className="absolute left-5 text-ink-3" />
            <span className="sr-only">Search products</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search analysers, reagents, brands…"
              className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              type="search"
            />
            <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[0.875rem] text-ink-3 sm:block">⌘K</kbd>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between py-6 text-sm text-ink-3" aria-live="polite">
        <p className="flex flex-wrap items-center gap-2">
          <span><span className="font-medium text-ink">{visible.length}</span> {visible.length === 1 ? 'product' : 'products'}{category ? ` in ${catBySlug.get(category)?.title}` : ''}</span>
          {type && (
            <button type="button" onClick={() => setType(null)} className="inline-flex items-center gap-1.5 rounded-[4px] bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100" aria-label={`Remove filter: ${type}`}>
              {type} <Icon name="fi-rr-cross-small" />
            </button>
          )}
        </p>
        <p className="hidden text-xs sm:block">{searchProvider === 'algolia' ? 'Search by Algolia' : 'Instant search'}</p>
      </div>

      <motion.ul layout className="grid grid-cols-2 gap-3 pb-16 sm:gap-4 sm:pb-24 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              // Off-screen cards skip rendering until they near the viewport (smoother scrolling through ~90 products);
              // the clip margin leaves room for the hover lift and shadow.
              className={cn('[content-visibility:auto] [contain-intrinsic-size:auto_380px] [overflow-clip-margin:48px]', p.featured && !category && !query && i === 0 && 'col-span-2')}
            >
              <ProductCard product={p} category={catBySlug.get(p.category)} wide={Boolean(p.featured && !category && !query && i === 0)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <div className="rounded-4xl border border-dashed border-line p-12 text-center">
          <p className="text-lg font-medium text-ink">No matches for “{query}”</p>
          <p className="mt-2 text-sm text-ink-3">Our team sources beyond the catalogue.</p>
          <Link href={helpHref('other', { message: `I'm looking for: ${query}` })} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            Ask us to source it
          </Link>
        </div>
      )}

      <section aria-labelledby="explore-categories" className="border-t border-line pb-12 pt-12 md:pb-16">
        <h2 id="explore-categories" className="text-2xl font-bold tracking-[-0.02em] text-ink">Explore Product Categories</h2>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {typeList.map(([t, n]) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => pickType(t)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-left text-sm text-ink transition hover:border-brand-300 hover:bg-brand-50"
              >
                <span>{t}</span>
                <span className="shrink-0 text-xs text-ink-3">{n} {n === 1 ? 'product' : 'products'}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </LayoutGroup>
  );
}

function ProductCard({ product, category, wide }: { product: Product; category?: Category; wide: boolean }) {
  const router = useRouter();
  return (
    <div className="relative h-full">
    <AddToQuote item={{ slug: product.slug, name: product.name, brand: product.brand, image: product.image }} compact className="absolute right-3.5 top-3.5 z-10 sm:right-5 sm:top-5" />
    <Link
      href={`/products/${product.slug}`}
      scroll={false}
      // Fetch the product as soon as the pointer or a finger is on it, so the sheet is ready by the click
      onMouseEnter={() => router.prefetch(`/products/${product.slug}`)}
      onTouchStart={() => router.prefetch(`/products/${product.slug}`)}
      className="group flex h-full flex-col rounded-lg border border-line bg-paper p-1.5 transition-all sm:p-2 duration-700 ease-out-expo hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]"
    >
      <ProductVisual product={product} category={category} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className={wide ? 'aspect-square rounded-md sm:aspect-auto sm:h-96' : 'aspect-square rounded-md'} />
      {/* Picture first: the image takes most of the card, the text stays to two short lines */}
      <div className="px-2.5 pb-3 pt-3 sm:px-3.5 sm:pb-4">
        <p className="flex items-center gap-2 text-xs font-medium text-ink-3">
          {product.brand}
          {product.newArrival && <span className="rounded-[4px] bg-signal px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-white">New</span>}
        </p>
        <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-ink sm:text-base">{product.name}</h2>
      </div>
    </Link>
    </div>
  );
}
