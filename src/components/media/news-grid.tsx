import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { NewsMore } from '@/components/media/news-more';
import { getArticles } from '@/lib/data';
import { kponeStory, storyHref } from '@/data/site-stories';
import { NewBadge } from '@/components/media/new-badge';

export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Media Centre, laid out like youversion.com/newsroom: a plain grid of large photos with the headline and
 * "Read more" beneath, nothing else. Every news, blog and press post from flokefama.com opens its full article.
 */
export async function NewsGrid() {
  // The Kpone Hospital renovation (Nov 2026) first: it opens its section on the CSR page
  const articles = [kponeStory, ...(await getArticles()).filter((a) => a.slug !== kponeStory.slug)];
  return (
    <section id="news" className="pattern-dots pattern-tr scroll-mt-28 bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">News, Blog &amp; Press</h2>
        <NewsMore initial={3}>
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={storyHref(a)} className="group block">
                <div className="relative aspect-[25/24] overflow-hidden bg-mist">
                  <NewBadge story={a} />
                  {a.image && (
                    <Image src={a.image.src} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 84vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />
                  )}
                </div>
                <h3 className="mt-5 text-xl font-medium leading-snug tracking-[-0.015em] text-ink md:text-2xl">{a.title}</h3>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                  Read more <Icon name="fi-rr-arrow-small-right" className="text-signal transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </NewsMore>
      </div>
    </section>
  );
}
