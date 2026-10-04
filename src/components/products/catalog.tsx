'use client';

import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductVisual } from '@/components/products/product-visual';
import { AddToQuote } from '@/components/sales/add-to-quote';
import { BedDouble, FlaskConical, Headset, HeartPulse, LayoutGrid, List, type LucideIcon, Microscope, Search, ShieldCheck, TestTube, Wrench } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { useQuoteList } from '@/lib/quote-list';
import { localSearch, searchProducts, searchProvider } from '@/lib/search';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Interactive B2B catalogue: category switching and keystroke search morph the grid in place
 * (no reloads). State is mirrored to the URL so every view is shareable.
 */
export function Catalog({ products, categories, initialCategory, initialQuery, initialType = null }: {
  products: Product[];
  categories: Category[];
  initialCategory: string | null;
  initialQuery: string;
  /** One of the original flokefama.com shop categories ("Hematology Analyzers"), from ?type= */
  initialType?: string | null;
}) {
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<string | null>(initialType);
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

  // Mirror state to the URL without a navigation.
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (query.trim()) params.set('q', query.trim());
    if (type) params.set('type', type);
    const next = `/products${params.size ? `?${params}` : ''}`;
    if (next !== `${location.pathname}${location.search}`) window.history.replaceState(null, '', next);
  }, [category, query, type]);

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

  const [sort, setSort] = useState<'az' | 'za' | 'brand'>('az');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const sorted = useMemo(() => {
    if (query.trim()) return visible; // keep search relevance order
    const out = [...visible];
    if (sort === 'az') out.sort((x, y) => x.name.localeCompare(y.name));
    if (sort === 'za') out.sort((x, y) => y.name.localeCompare(x.name));
    if (sort === 'brand') out.sort((x, y) => x.brand.localeCompare(y.brand) || x.name.localeCompare(y.name));
    return out;
  }, [visible, sort, query]);

  // A short reference per product (IVD-001 …), numbered within its department
  const refs = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) {
      const code = (codes[c.slug] ?? c.short.slice(0, 3)).toUpperCase();
      products.filter((p) => p.category === c.slug).forEach((p, i) => m.set(p.slug, `${code}-${String(i + 1).padStart(3, '0')}`));
    }
    return m;
  }, [categories, products]);

  const tabs = [{ slug: null, title: 'All equipment' }, ...categories.map((c) => ({ slug: c.slug, title: c.short }))];
  const countIn = (slug: string | null) => (slug ? products.filter((p) => p.category === slug).length : products.length);

  return (
    <LayoutGroup>
      {/* Department tabs: icon, name and how many products each holds */}
      <div role="tablist" aria-label="Departments" className="-mx-5 flex overflow-x-auto border-b border-line px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        {tabs.map((t) => {
          const active = category === t.slug;
          const T = tabIcons[t.slug ?? 'all'] ?? tabIcons.all;
          return (
            <button
              key={t.title}
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(t.slug)}
              className={cn('relative flex shrink-0 items-center gap-2.5 px-4 py-4 text-base font-semibold transition-colors md:px-6', active ? 'text-ink' : 'text-ink-3 hover:text-ink')}
            >
              <T.icon className={cn('size-5', T.color)} strokeWidth={1.7} aria-hidden />
              {t.title}
              <span className={cn('px-1.5 py-0.5 text-[0.875rem]', active ? 'bg-brand-600 text-white' : 'bg-mist text-ink-3')}>{String(countIn(t.slug)).padStart(2, '0')}</span>
              {active && <motion.span layoutId="cat-line" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
            </button>
          );
        })}
      </div>

      {/* Toolbar: search, sort and view */}
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-mist/90 px-5 py-4 backdrop-blur-xl md:mx-0 md:border-x md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex h-12 flex-1 items-center border border-line bg-paper pl-12 pr-4 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
            <Search className="absolute left-4 size-5 text-ink-3" aria-hidden />
            <span className="sr-only">Search products</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search equipment, brand or type…"
              className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
              type="search"
            />
            <kbd className="hidden border border-line px-1.5 py-0.5 text-[0.875rem] text-ink-3 sm:block">⌘K</kbd>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex h-12 flex-1 items-center gap-3 lg:flex-none">
              <span className=" text-[0.9375rem] text-ink-3">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-12 flex-1 border border-line bg-paper px-3 text-base text-ink outline-none focus:border-brand-500 lg:w-44">
                <option value="az">Name (A–Z)</option>
                <option value="za">Name (Z–A)</option>
                <option value="brand">Brand</option>
              </select>
            </label>
            <div className="flex border border-line" role="group" aria-label="View">
              {(['grid', 'list'] as const).map((v) => {
                const V = v === 'grid' ? LayoutGrid : List;
                return (
                  <button key={v} type="button" aria-pressed={view === v} aria-label={v === 'grid' ? 'Grid view' : 'List view'} onClick={() => setView(v)} className={cn('grid size-12 place-items-center transition-colors', view === v ? 'bg-midnight text-white' : 'bg-paper text-ink-3 hover:text-ink')}>
                    <V className="size-5" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 py-5" aria-live="polite">
        <p className="flex flex-wrap items-center gap-2 text-[0.9375rem] text-ink-3">
          <span><span className="text-ink">{sorted.length}</span> {sorted.length === 1 ? 'item' : 'items'} found{category ? ` in ${catBySlug.get(category)?.title}` : ''}</span>
          {type && (
            <button type="button" onClick={() => setType(null)} className="inline-flex items-center gap-1.5 bg-brand-50 px-3 py-1 font-sans text-xs font-medium normal-case tracking-normal text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100" aria-label={`Remove filter: ${type}`}>
              {type} <Icon name="fi-rr-cross-small" />
            </button>
          )}
        </p>
      </div>

      <motion.ul layout className={cn('grid gap-px border border-line bg-line', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
        <AnimatePresence mode="popLayout">
          {sorted.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className="bg-paper"
            >
              <ProductCard product={p} category={catBySlug.get(p.category)} code={refs.get(p.slug) ?? ''} list={view === 'list'} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {sorted.length === 0 && (
        <div className="border border-dashed border-line p-12 text-center">
          <p className="text-lg font-medium text-ink">No matches for “{query}”</p>
          <p className="mt-2 text-ink-3">Our team sources beyond the catalogue.</p>
          <Link href={`/quote?need=${encodeURIComponent(query)}`} className="mt-5 inline-flex items-center gap-1 font-medium text-brand-600">
            Ask us to source it
          </Link>
        </div>
      )}

      {/* What comes with everything we supply */}
      <ul className="flex flex-wrap gap-x-8 gap-y-3 pb-16 pt-6 text-ink-3 sm:pb-24">
        <li className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-600" aria-hidden /> Authorised distributor</li>
        <li className="flex items-center gap-2"><Wrench className="size-5 text-[#0074bb]" aria-hidden /> Installation &amp; training</li>
        <li className="flex items-center gap-2"><Headset className="size-5 text-signal" aria-hidden /> After-sales support</li>
      </ul>
    </LayoutGroup>
  );
}

const codes: Record<string, string> = { 'in-vitro-diagnostics': 'IVD', 'critical-care': 'ICU', laboratory: 'LAB', 'hospital-equipment': 'HSP', consumables: 'CON' };

const tabIcons: Record<string, { icon: LucideIcon; color: string }> = {
  all: { icon: LayoutGrid, color: 'text-ink' },
  'in-vitro-diagnostics': { icon: Microscope, color: 'text-brand-600' },
  'critical-care': { icon: HeartPulse, color: 'text-signal' },
  laboratory: { icon: FlaskConical, color: 'text-[#087d88]' },
  'hospital-equipment': { icon: BedDouble, color: 'text-[#0068a8]' },
  consumables: { icon: TestTube, color: 'text-[#a87a00]' },
};

/** A catalogue cell: reference, photo, brand · type, name, a short spec sheet, then Add to cart and Details. */
function ProductCard({ product, category, code, list }: { product: Product; category?: Category; code: string; list: boolean }) {
  const inCart = useQuoteList().some((x) => x.slug === product.slug);
  const rows = [
    { label: 'Type', value: product.types?.[0] ?? category?.title ?? '' },
    { label: 'Department', value: category?.short ?? '' },
    { label: 'Support', value: 'Installation & training' },
  ].filter((r) => r.value);
  const note = product.highlights[0];
  // Hover, keyboard focus or "in your cart" colours the card: deep Mirage with soft-green accents
  return (
    <div
      data-on={inCart || undefined}
      className={cn(
        'group/card flex h-full flex-col p-5 transition-colors duration-500 sm:p-6',
        'hover:bg-[#10191e] focus-within:bg-[#10191e] data-[on]:bg-[#10191e]',
        list && 'md:grid md:grid-cols-[240px_minmax(0,1fr)_minmax(0,0.8fr)] md:items-start md:gap-8',
      )}
    >
      <div className={cn(list && 'md:row-span-2')}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-3 transition-colors group-hover/card:text-brand-300 group-focus-within/card:text-brand-300 group-data-[on]/card:text-brand-300">{code}</span>
          {inCart ? (
            <span className="flex items-center gap-1.5 border border-brand-300/40 bg-brand-300/10 px-2 py-1 text-xs font-semibold text-brand-300">
              <span className="size-1.5 bg-brand-300" aria-hidden />In your cart
            </span>
          ) : (
            product.newArrival && (
              <span className="flex items-center gap-1.5 border border-signal/30 bg-[#fdecec] px-2 py-1 text-xs font-semibold text-signal-700">
                <span className="size-1.5 bg-signal" aria-hidden />New
              </span>
            )
          )}
        </div>
        <Link href={`/products/${product.slug}`} scroll={false} tabIndex={-1} aria-hidden className="mt-4 block">
          <ProductVisual product={product} category={category} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] rounded-none" />
        </Link>
      </div>
      <div className="mt-5 flex flex-col md:mt-0">
        <p className="text-sm font-semibold text-brand-700 transition-colors group-hover/card:text-brand-300 group-focus-within/card:text-brand-300 group-data-[on]/card:text-brand-300">
          {product.brand} · {category?.short}
        </p>
        <h2 className="mt-1.5 text-xl font-bold leading-snug tracking-[-0.01em] text-ink transition-colors group-hover/card:text-white group-focus-within/card:text-white group-data-[on]/card:text-white">
          <Link href={`/products/${product.slug}`} scroll={false} className="outline-none">{product.name}</Link>
        </h2>
        {note && <p className="mt-2 line-clamp-2 text-base leading-relaxed text-ink-3 transition-colors group-hover/card:text-white/75 group-focus-within/card:text-white/75 group-data-[on]/card:text-white/75">{note}</p>}
      </div>
      <dl className={cn('my-5 space-y-2.5 border-t border-line pt-4 text-[1.0625rem] transition-colors group-hover/card:border-white/10 group-focus-within/card:border-white/10 group-data-[on]/card:border-white/10', list && 'md:my-0 md:border-t-0 md:pt-0')}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-3 transition-colors group-hover/card:text-white/60 group-focus-within/card:text-white/60 group-data-[on]/card:text-white/60">{r.label}</dt>
            <dd className="text-right font-semibold text-ink transition-colors group-hover/card:text-brand-300 group-focus-within/card:text-brand-300 group-data-[on]/card:text-brand-300">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className={cn('mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 transition-colors group-hover/card:border-white/10 group-focus-within/card:border-white/10 group-data-[on]/card:border-white/10', list && 'md:col-start-3 md:mt-4')}>
        <AddToQuote
          item={{ slug: product.slug, name: product.name, brand: product.brand, image: product.image }}
          className="h-11 rounded-md text-base group-hover/card:text-brand-300 group-hover/card:ring-brand-300/50 group-focus-within/card:text-brand-300 group-focus-within/card:ring-brand-300/50 group-data-[on]/card:bg-transparent group-data-[on]/card:text-brand-300 group-data-[on]/card:ring-brand-300/50"
        />
        <Link href={`/products/${product.slug}`} scroll={false} className="text-base font-semibold text-ink underline-offset-4 transition-colors hover:underline group-hover/card:text-brand-300 group-focus-within/card:text-brand-300 group-data-[on]/card:text-brand-300">
          Details
        </Link>
      </div>
    </div>
  );
}
