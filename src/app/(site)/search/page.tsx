import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { searchSite } from '@/lib/site-search';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };

/** Site search (from the search field in the menu bar): pages, equipment, the shop, news and events. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 100);
  const groups = q ? await searchSite(q) : [];
  const count = groups.reduce((n, g) => n + g.hits.length, 0);

  return (
    <div className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1000px] px-5 md:px-10">
        <h1 className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold tracking-[-0.03em] text-ink">Search</h1>
        <form action="/search" role="search" className="mt-6 flex h-14 items-center border border-line bg-paper focus-within:border-brand-500">
          <Icon name="fi-rr-search" className="ml-5 text-lg text-ink-3" />
          <input name="q" type="search" defaultValue={q} placeholder="Search equipment, products, news…" aria-label="Search the site" className="h-full min-w-0 flex-1 bg-transparent px-4 text-lg text-ink outline-none placeholder:text-ink-3/60" />
          <button type="submit" className="h-full bg-cta px-6 font-semibold text-white transition hover:bg-cta-700">Search</button>
        </form>

        {q && (
          <p className="mt-6 text-ink-3" aria-live="polite">
            {count ? `${count} result${count === 1 ? '' : 's'} for “${q}”` : `No results for “${q}”. Try another word, or `}
            {!count && <Link href="/support" className="font-semibold text-brand-700 hover:underline">ask our team</Link>}
          </p>
        )}

        {groups.map((g) => (
          <section key={g.label} className="mt-10">
            <h2 className="border-b border-line pb-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink-3">{g.label}</h2>
            <ul className="divide-y divide-line">
              {g.hits.map((h) => (
                <li key={`${h.href}${h.title}`}>
                  <Link href={h.href} className="group flex items-center gap-5 py-4">
                    {h.image && (
                      <span className="relative size-16 shrink-0 overflow-hidden bg-mist">
                        <Image src={h.image} alt="" fill sizes="96px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-ink group-hover:text-brand-700">{h.title}</span>
                      <span className="mt-0.5 line-clamp-2 block text-ink-3">{h.text}</span>
                    </span>
                    <Icon name="fi-rr-arrow-small-right" className="shrink-0 text-xl text-ink-3 transition group-hover:translate-x-1 group-hover:text-brand-700" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
