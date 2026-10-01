import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/media/article-body';
import { formatDate } from '@/components/media/news-grid';
import { Icon } from '@/components/ui/icon';
import { articles } from '@/data/articles';
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

/** A news, blog or press article, as published on flokefama.com. */
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = articles.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const a = articles[index];
  const newer = articles[index - 1];
  const older = articles[index + 1];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    datePublished: a.date,
    image: a.image ? [`${siteUrl}${a.image.src}`] : undefined,
    publisher: { '@type': 'Organization', name: 'Flokefama Company Limited' },
  };

  return (
    <article className="bg-paper pb-20 pt-28 md:pb-32 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[760px] px-5">
        <Link href="/events#news" className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition hover:text-ink">
          <Icon name="fi-rr-arrow-small-left" /> News, Blog &amp; Press
        </Link>
        <p className="label mt-8 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-brand-500" aria-hidden /> {a.categories.join(', ')} · <time dateTime={a.date}>{formatDate(a.date)}</time>
        </p>
        <h1 className="display mt-4 text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] leading-[1.08]">{a.title}</h1>
      </div>

      {a.image && (
        <div className="mx-auto mt-10 max-w-[1040px] px-5">
          <div className="overflow-hidden rounded-4xl border border-line bg-mist">
            <Image src={a.image.src} alt={a.image.alt} width={a.image.width} height={a.image.height} priority sizes="(min-width: 1080px) 1040px, 100vw" className="h-auto max-h-[70vh] w-full object-contain" />
          </div>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-[760px] px-5">
        <ArticleBody blocks={a.blocks} />

        <nav aria-label="More articles" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {older ? (
            <Link href={`/news/${older.slug}`} className="group rounded-2xl border border-line p-5 transition hover:border-brand-300">
              <span className="label">Previous</span>
              <span className="mt-2 block font-semibold leading-snug text-ink group-hover:text-brand-700">{older.title}</span>
            </Link>
          ) : <span />}
          {newer && (
            <Link href={`/news/${newer.slug}`} className="group rounded-2xl border border-line p-5 text-right transition hover:border-brand-300">
              <span className="label">Next</span>
              <span className="mt-2 block font-semibold leading-snug text-ink group-hover:text-brand-700">{newer.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
