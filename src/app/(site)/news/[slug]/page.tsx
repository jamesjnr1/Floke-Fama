import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReadingProgress, ShareButtons } from '@/components/media/article-chrome';
import { ArticleBody, headingId } from '@/components/media/article-body';
import { formatDate } from '@/components/media/news-grid';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { articles, type Article } from '@/data/articles';
import { siteUrl } from '@/lib/utils';

export const dynamicParams = false;
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/news/${a.slug}` },
    openGraph: { type: 'article', title: a.title, description: a.excerpt, publishedTime: a.date, images: a.image ? [a.image.src] : undefined },
  };
}

/** Minutes to read, at about 220 words a minute. */
function readingTime(a: Article) {
  const words = a.blocks
    .map((b) => (b.type === 'h' ? b.text : b.type === 'p' || b.type === 'quote' ? b.runs.map((r) => r.t).join('') : b.type === 'ul' || b.type === 'ol' ? b.items.flat().map((r) => r.t).join(' ') : ''))
    .join(' ')
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** A News, Blog & Press article from flokefama.com, presented as an editorial page. */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = articles.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const a = articles[index];
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const toc = a.blocks.filter((b): b is { type: 'h'; text: string } => b.type === 'h');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    datePublished: a.date,
    image: a.image ? [`${siteUrl}${a.image.src}`] : undefined,
    publisher: { '@type': 'Organization', name: 'Flokefama Company Limited' },
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="relative isolate overflow-hidden bg-canvas pb-12 pt-32 md:pb-16 md:pt-40">
        <div aria-hidden className="grid-fade-light absolute inset-0 -z-10" />
        <div className="mx-auto max-w-[1080px] px-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-3">
            <Link href="/events" className="hover:text-ink">Events &amp; Activities</Link>
            <Icon name="fi-rr-angle-small-right" />
            <Link href="/events#news" className="hover:text-ink">News, Blog &amp; Press</Link>
          </nav>
          <ul className="mt-8 flex flex-wrap gap-2">
            {a.categories.map((c) => (
              <li key={c} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">{c}</li>
            ))}
          </ul>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.1rem,1.3rem+3vw,3.75rem)] leading-[1.05]">{a.title}</h1>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-3">
              <span className="flex items-center gap-2"><Icon name="fi-rr-calendar" className="text-brand-600" /> <time dateTime={a.date}>{formatDate(a.date)}</time></span>
              <span className="flex items-center gap-2"><Icon name="fi-rr-clock" className="text-brand-600" /> {readingTime(a)} min read</span>
              <span className="flex items-center gap-2"><Icon name="fi-rr-building" className="text-brand-600" /> Flokefama Media Centre</span>
            </p>
            <ShareButtons title={a.title} />
          </div>
        </div>
      </header>

      {/* Cover: framed over a soft, blurred copy of itself so posters and photos both sit well */}
      {a.image && (
        <div className="bg-canvas">
          <div className="mx-auto max-w-[1180px] px-5">
            <figure className="relative isolate overflow-hidden rounded-5xl border border-line bg-midnight shadow-[0_40px_80px_-50px_rgb(11_21_16/0.6)]">
              <Image src={a.image.src} alt="" fill aria-hidden sizes="100vw" className="-z-10 scale-110 object-cover opacity-50 blur-2xl" />
              <div className="relative mx-auto aspect-[16/9] max-h-[640px] w-full">
                <Image src={a.image.src} alt={a.image.alt} fill priority sizes="(min-width: 1180px) 1140px, 100vw" className="object-contain" />
              </div>
            </figure>
          </div>
        </div>
      )}

      {/* Body */}
      <article className="bg-canvas pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="mx-auto grid max-w-[1080px] gap-12 px-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-8">
              {toc.length > 1 && (
                <nav aria-label="In this article">
                  <p className="label">In this article</p>
                  <ol className="mt-4 space-y-2.5 border-l border-line">
                    {toc.map((h) => (
                      <li key={h.text}>
                        <a href={`#${headingId(h.text)}`} className="-ml-px block border-l-2 border-transparent pl-4 text-sm leading-snug text-ink-3 transition hover:border-brand-500 hover:text-ink">{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div>
                <p className="label">Share</p>
                <div className="mt-4"><ShareButtons title={a.title} /></div>
              </div>
            </div>
          </aside>
          <div className="min-w-0 max-w-[700px] rounded-4xl bg-paper p-6 shadow-[0_30px_60px_-50px_rgb(11_21_16/0.4)] ring-1 ring-line md:p-12">
            <ArticleBody blocks={a.blocks} />
          </div>
        </div>
      </article>

      {/* Closing call to action */}
      <section className="bg-canvas pb-16">
        <div className="mx-auto max-w-[1080px] px-5">
          <div className="relative isolate flex flex-col items-start justify-between gap-6 overflow-hidden rounded-4xl bg-midnight p-8 text-white md:flex-row md:items-center md:p-12">
            <div aria-hidden className="absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.35),transparent_65%)]" />
            <div>
              <p className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">Looking to upgrade your facility?</p>
              <p className="mt-2 max-w-lg text-white/65">Trusted, end-to-end medical technology solutions from Flokefama.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="glow" size="lg"><Link href="/quote">Request a quote <Icon name="fi-rr-arrow-small-right" /></Link></Button>
              <Button asChild variant="glass" size="lg"><Link href="/contact">Contact us</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* More from the Media Centre */}
      <section className="border-t border-line bg-paper py-16 md:py-24">
        <div className="mx-auto max-w-[1080px] px-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">More from the Media Centre</h2>
            <Link href="/events#news" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-brand-700 sm:inline-flex">All news <Icon name="fi-rr-arrow-small-right" /></Link>
          </div>
          <ul className="swipe-row mt-8 gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/news/${r.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]">
                  {r.image && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                      <Image src={r.image.src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-top transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="label">{r.categories.join(', ')} · {formatDate(r.date)}</p>
                    <h3 className="mt-2 font-semibold leading-snug text-ink">{r.title}</h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
