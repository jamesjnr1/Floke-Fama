import { NewsPhoto } from '@/components/media/news-photo';
import Link from 'next/link';
import { NewsMore } from '@/components/media/news-more';
import { getArticles } from '@/lib/data';
import { storyHref, withSiteStories } from '@/data/site-stories';
import { NewBadge } from '@/components/media/new-badge';

export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Media Centre: cards like "More from the Media Centre" under each article (photo, categories and date, headline).
 * Every news, blog and press post from flokefama.com opens its full article.
 */
export async function NewsGrid() {
  // The Kpone Hospital renovation (Nov 2026) first: it opens its section on the CSR page
  const articles = withSiteStories(await getArticles());
  return (
    <section id="news" className="scroll-mt-28 bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.01em] text-ink">News, Blog &amp; Press</h2>
        <NewsMore initial={3}>
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={storyHref(a)} className="group flex h-full flex-col overflow-hidden border border-line bg-paper transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                  {a.image && <NewsPhoto image={a.image} sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 84vw" className="object-top" />}
                  <NewBadge story={a} />
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="label">{a.categories.join(', ')} · {formatDate(a.date)}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-ink">{a.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </NewsMore>
      </div>
    </section>
  );
}
