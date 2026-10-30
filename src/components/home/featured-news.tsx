import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getArticles } from '@/lib/data';
import type { Article } from '@/data/articles';

/** The stories that lead: the Forbes Africa feature, the Mindray IVD awards and the University of Ghana partnership. */
const featured = [
  'flokefama-featured-in-forbes-africa-driving-healthcare-excellence-across-ghana',
  'a-milestone-for-ghana-flokefama-sweeps-prestigious-mindray-ivd-awards',
  'flokefama-partners-with-university-of-ghana-to-shape-the-next-generation-of-biomedical-engineers',
];

/**
 * How the section is laid out. 'row' (default): three equal stories side by side. 'feature': one large story with two beside it. 'list': the heading on the left,
 * the three stories as rows (photo beside headline) on the right. 'spotlight': the Forbes feature as one wide card
 * (photo beside the story), the other two underneath as text.
 * Switch with NEXT_PUBLIC_NEWS_LAYOUT in Vercel (then redeploy).
 */
const layouts = ['row', 'list', 'spotlight', 'feature'] as const;
export type NewsLayout = (typeof layouts)[number];
const env = process.env.NEXT_PUBLIC_NEWS_LAYOUT as NewsLayout | undefined;
const chosen: NewsLayout = env && layouts.includes(env) ? env : 'feature';

const Chip = () => <p className="inline-block w-fit bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Flokefama newsroom</p>;
const AllNews = ({ className = '' }: { className?: string }) => (
  <Link href="/events#news" className={`group inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800 ${className}`}>
    Visit newsroom <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
  </Link>
);
const ReadMore = () => (
  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
    Read more <Icon name="fi-rr-arrow-small-right" className="text-signal transition-transform group-hover:translate-x-0.5" />
  </span>
);
const Photo = ({ a, ratio, sizes }: { a: Article; ratio: string; sizes: string }) => (
  <span className={`relative block overflow-hidden bg-mist ${ratio}`}>
    {a.image && <Image src={a.image.src} alt="" fill sizes={sizes} className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />}
  </span>
);
const Heading = () => (
  <h2 id="featured-news" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
    Newsroom
  </h2>
);

/** Home: featured news, from the News, Blog & Press posts (the newest fill in if a featured story is missing). */
export async function FeaturedNews({ layout = chosen }: { layout?: NewsLayout }) {
  const articles = await getArticles();
  const picked = featured.map((s) => articles.find((a) => a.slug === s)).filter((a): a is Article => Boolean(a));
  const stories = [...picked, ...articles.filter((a) => !picked.includes(a))].slice(0, 3);
  if (!stories.length) return null;
  const [lead, ...rest] = stories;

  const header = (
    <Reveal className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <Chip />
        <Heading />
        <p className="no-justify mt-3 max-w-xl text-base leading-relaxed text-ink-3 md:text-lg">The latest stories, company milestones, partnerships and updates from across Flokefama.</p>
      </div>
      <AllNews />
    </Reveal>
  );

  let body: React.ReactNode;
  if (layout === 'list') {
    return (
      <section aria-labelledby="featured-news" className="bg-[linear-gradient(180deg,#f5faf6_0%,#ffffff_100%)] pb-16 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <Chip />
            <Heading />
            <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">The latest stories, company milestones, partnerships and updates from across Flokefama.</p>
            <AllNews className="mt-6" />
          </Reveal>
          <ul className="grid gap-4">
            {stories.map((a, i) => (
              <li key={a.slug}>
                <Reveal delay={i * 0.05}>
                  <Link href={`/news/${a.slug}`} className="group grid items-center gap-5 bg-canvas p-4 transition-colors hover:bg-brand-50 sm:grid-cols-[220px_1fr] sm:gap-6">
                    <Photo a={a} ratio="aspect-[4/3]" sizes="(min-width: 640px) 220px, 100vw" />
                    <span className="block py-1">
                      <span className="block text-sm text-ink-3">{formatDate(a.date)}</span>
                      <span className="mt-1.5 block text-lg font-bold leading-snug tracking-[-0.015em] text-ink group-hover:text-brand-700 md:text-xl">{a.title.trim()}</span>
                      <ReadMore />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } else if (layout === 'spotlight') {
    body = (
      <>
        <Reveal className="mt-10 md:mt-12">
          <Link href={`/news/${lead.slug}`} className="group grid overflow-hidden bg-canvas md:grid-cols-2">
            <Photo a={lead} ratio="aspect-[16/10] md:aspect-auto md:min-h-[380px]" sizes="(min-width: 768px) 600px, 100vw" />
            <span className="flex flex-col justify-center p-7 md:p-12">
              <span className="block text-sm text-ink-3">{formatDate(lead.date)}</span>
              <span className="mt-2 block text-2xl font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-brand-700 md:text-[2rem]">{lead.title.trim()}</span>
              <span className="no-justify mt-4 block leading-relaxed text-ink-3">{lead.excerpt}</span>
              <ReadMore />
            </span>
          </Link>
        </Reveal>
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {rest.map((a, i) => (
            <li key={a.slug}>
              <Reveal delay={(i + 1) * 0.05} className="h-full">
                <Link href={`/news/${a.slug}`} className="group flex h-full flex-col bg-canvas p-7 transition-colors hover:bg-brand-50">
                  <span className="block text-sm text-ink-3">{formatDate(a.date)}</span>
                  <span className="mt-2 block text-lg font-bold leading-snug tracking-[-0.015em] text-ink group-hover:text-brand-700">{a.title.trim()}</span>
                  <ReadMore />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (layout === 'feature') {
    body = (
      <div className="mt-9 grid items-stretch gap-6 md:mt-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        <Reveal className="h-full">
          <Link href={`/news/${lead.slug}`} className="group flex h-full flex-col overflow-hidden bg-white shadow-[0_12px_40px_rgba(10,58,40,0.07)] ring-1 ring-brand-900/5 transition-shadow hover:shadow-[0_18px_48px_rgba(10,58,40,0.12)]">
            <Photo a={lead} ratio="aspect-[16/9]" sizes="(min-width: 1024px) 700px, 100vw" />
            <span className="flex flex-1 flex-col p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Featured story</span>
              <span className="mt-3 block text-sm text-ink-3">{formatDate(lead.date)}</span>
              <span className="mt-2 block text-2xl font-bold leading-snug tracking-[-0.025em] text-ink group-hover:text-brand-700 md:text-[1.8rem]">{lead.title.trim()}</span>
              <span className="no-justify mt-3 block leading-relaxed text-ink-3">{lead.excerpt}</span>
              <span className="mt-auto pt-5"><ReadMore /></span>
            </span>
          </Link>
        </Reveal>
        <div className="flex flex-col gap-5">
          <p className="border-b border-brand-900/10 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-800">Latest stories</p>
          <ul className="grid flex-1 gap-5">
            {rest.map((a, i) => (
              <li key={a.slug} className="min-h-0">
                <Reveal delay={(i + 1) * 0.06} className="h-full">
                  <Link href={`/news/${a.slug}`} className="group grid h-full grid-cols-[116px_1fr] gap-4 border-b border-brand-900/10 pb-5 sm:grid-cols-[140px_1fr] lg:grid-cols-[124px_1fr]">
                    <Photo a={a} ratio="aspect-[4/3]" sizes="(min-width: 1024px) 124px, 140px" />
                    <span className="flex min-w-0 flex-col py-1">
                      <span className="text-xs text-ink-3">{formatDate(a.date)}</span>
                      <span className="mt-2 line-clamp-3 text-base font-bold leading-snug tracking-[-0.015em] text-ink group-hover:text-brand-700 md:text-lg">{a.title.trim()}</span>
                      <span className="mt-auto pt-3 text-sm font-semibold text-brand-700">Read story <Icon name="fi-rr-arrow-small-right" className="inline transition-transform group-hover:translate-x-0.5" /></span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } else {
    // row: three equal stories side by side
    body = (
      <ul className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
        {stories.map((a, i) => (
          <li key={a.slug}>
            <Reveal delay={i * 0.05} className="h-full">
              <Link href={`/news/${a.slug}`} className="group flex h-full flex-col">
                <Photo a={a} ratio="aspect-[4/3]" sizes="(min-width: 768px) 400px, 100vw" />
                <span className="mt-5 block text-sm text-ink-3">{formatDate(a.date)}</span>
                <span className="mt-2 block text-xl font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-brand-700">{a.title.trim()}</span>
                <span className="mt-auto">
                  <ReadMore />
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section aria-labelledby="featured-news" className="bg-[linear-gradient(180deg,#f5faf6_0%,#ffffff_100%)] pb-16 pt-16 md:pb-28 md:pt-24">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        {header}
        {body}
      </div>
    </section>
  );
}
