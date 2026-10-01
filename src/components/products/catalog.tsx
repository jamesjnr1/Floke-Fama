'use client';

import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductVisual } from '@/components/products/product-visual';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { localSearch, searchProducts, searchProvider } from '@/lib/search';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Interactive B2B catalogue: category switching and keystroke search morph the grid in place
 * (no reloads). State is mirrored to the URL so every view is shareable.
 */
export function Catalog({ products, categories, initialCategory, initialQuery }: {
  products: Product[];
  categories: Category[];
  initialCategory: string | null;
  initialQuery: string;
}) {
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [remote, setRemote] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const catBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);

  // Local search is synchronous; Algolia results arrive asynchronously.
  const localResults = useMemo(() => localSearch(query || ' ', category, products), [query, category, products]);
  const visibleSlugs = searchProvider === 'algolia' && query.trim() ? remote ?? [] : query.trim() ? localResults : products.filter((p) => !category || p.category === category).map((p) => p.slug);
  const visible = visibleSlugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));

  useEffect(() => {
    if (searchProvider !== 'algolia' || !query.trim()) return;
    const t = setTimeout(() => searchProducts(query, category, products).then(setRemote).catch(() => setRemote(localResults)), 120);
    return () => clearTimeout(t);
  }, [query, category, products, localResults]);

  // Mirror state to the URL without a navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query.trim()) params.set('q', query.trim());
    const next = `/products${params.size ? `?${params}` : ''}`;
    if (next !== `${location.pathname}${location.search}`) window.history.replaceState(null, '', next);
  }, [category, query]);

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

  const tabs = [{ slug: null, title: 'All equipment' }, ...categories.map((c) => ({ slug: c.slug, title: c.short }))];

  return (
    <LayoutGroup>
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-canvas/85 px-5 py-4 backdrop-blur-xl md:-mx-10 md:px-10">
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
                  className={cn('relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors', active ? 'text-white' : 'text-ink-3 hover:text-ink')}
                >
                  {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-midnight" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
                  <span className="relative">{t.title}</span>
                </button>
              );
            })}
          </div>
          <label className="group relative flex h-12 w-full items-center rounded-full border border-line bg-paper pl-12 pr-4 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 lg:w-96">
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
            <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-ink-3 sm:block">⌘K</kbd>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between py-6 text-sm text-ink-3" aria-live="polite">
        <p><span className="font-medium text-ink">{visible.length}</span> {visible.length === 1 ? 'product' : 'products'}{category ? ` in ${catBySlug.get(category)?.title}` : ''}</p>
        <p className="hidden text-xs sm:block">{searchProvider === 'algolia' ? 'Search by Algolia' : 'Instant search'}</p>
      </div>

      <motion.ul layout className="grid grid-cols-2 gap-3 pb-16 sm:gap-4 sm:pb-24 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className={cn(p.featured && !category && !query && i === 0 && 'col-span-2')}
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
          <Link href={`/quote?need=${encodeURIComponent(query)}`} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
            Ask us to source it <Icon name="fi-rr-arrow-small-right" />
          </Link>
        </div>
      )}
    </LayoutGroup>
  );
}

function ProductCard({ product, category, wide }: { product: Product; category?: Category; wide: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      scroll={false}
      className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-1.5 transition-all sm:rounded-4xl sm:p-2 duration-700 ease-out-expo hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_60px_-30px_rgb(0_40_21/0.35)]"
    >
      <ProductVisual product={product} category={category} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className={cn('rounded-[1.1rem] sm:rounded-[1.6rem]', wide ? 'aspect-[16/9] sm:aspect-auto sm:h-72' : 'aspect-square sm:aspect-[4/3]')} />
      <div className="flex flex-1 items-end justify-between gap-4 px-2.5 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-5">
        <div>
          <p className="label flex items-center gap-2">{product.brand}{product.newArrival && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-white">New</span>}</p>
          <h2 className="mt-1 text-sm font-semibold leading-snug tracking-tight text-ink sm:mt-1.5 sm:text-lg">{product.name}</h2>
          <p className="mt-1 line-clamp-2 hidden text-sm font-light text-ink-3 sm:block">{product.summary}</p>
          {product.specs[0] && <Badge className="mt-3 hidden sm:inline-flex">{product.specs[0].value}</Badge>}
        </div>
        <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-mist text-ink transition-all sm:grid duration-500 group-hover:rotate-45 group-hover:bg-brand-600 group-hover:text-white">
          <Icon name="fi-rr-arrow-up-right" />
        </span>
      </div>
    </Link>
  );
}
