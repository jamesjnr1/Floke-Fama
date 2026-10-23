import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getArticles } from '@/lib/data';

/** The stories that lead: the Forbes Africa feature, the Mindray IVD awards and the University of Ghana partnership. */
const featured = [
  'flokefama-featured-in-forbes-africa-driving-healthcare-excellence-across-ghana',
  'a-milestone-for-ghana-flokefama-sweeps-prestigious-mindray-ivd-awards',
  'flokefama-partners-with-university-of-ghana-to-shape-the-next-generation-of-biomedical-engineers',
];

/**
 * Home: featured news. One story large on the left (photo, date, headline, summary), two beside it as a photo
 * with the headline; "All news" opens the News, Blog & Press list. Falls back to the newest posts.
 */
export async function FeaturedNews() {
  const articles = await getArticles();
  const picked = featured.map((s) => articles.find((a) => a.slug === s)).filter((a): a is (typeof articles)[number] => Boolean(a));
  const stories = [...picked, ...articles.filter((a) => !picked.includes(a))].slice(0, 3);
  if (!stories.length) return null;
  const [lead, ...rest] = stories;

  return (
    <section aria-labelledby="featured-news" className="bg-paper pb-16 md:pb-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-block w-fit bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">In the news</p>
            <h2 id="featured-news" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
              Featured news
            </h2>
          </div>
          <Link href="/events#news" className="group inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
            All news <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          <Reveal>
            <Link href={`/news/${lead.slug}`} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden bg-mist">
                {lead.image && <Image src={lead.image.src} alt="" fill sizes="(min-width: 1024px) 680px, 100vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />}
              </span>
              <span className="mt-5 block text-sm text-ink-3">{formatDate(lead.date)}</span>
              <span className="mt-2 block text-2xl font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-brand-700 md:text-[1.75rem]">{lead.title.trim()}</span>
              <span className="no-justify mt-3 block leading-relaxed text-ink-3">{lead.excerpt}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                Read more <Icon name="fi-rr-arrow-small-right" className="text-signal transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>

          <ul className="grid content-start gap-8">
            {rest.map((a, i) => (
              <li key={a.slug}>
                <Reveal delay={(i + 1) * 0.06}>
                  <Link href={`/news/${a.slug}`} className="group block">
                    <span className="relative block aspect-[16/9] overflow-hidden bg-mist">
                      {a.image && <Image src={a.image.src} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />}
                    </span>
                    <span className="mt-4 block text-sm text-ink-3">{formatDate(a.date)}</span>
                    <span className="mt-1.5 block text-lg font-bold leading-snug tracking-[-0.015em] text-ink group-hover:text-brand-700">{a.title.trim()}</span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
