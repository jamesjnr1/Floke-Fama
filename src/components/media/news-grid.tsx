import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { NewsMore } from '@/components/media/news-more';
import { getArticles } from '@/lib/data';

export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Media Centre, laid out like youversion.com/newsroom: a plain grid of large photos with the headline and
 * "Read more" beneath, nothing else. Every news, blog and press post from flokefama.com opens its full article.
 */
export async function NewsGrid() {
  const articles = await getArticles();
  return (
    <section id="news" className="scroll-mt-28 bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <p className="eyebrow">Latest news</p>
        <h2 className="mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
          News, Blog <em className="font-serif font-normal">&amp; Press</em>
        </h2>
        <NewsMore initial={6}>
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/news/${a.slug}`} className="group block">
                <div className="relative aspect-[25/24] overflow-hidden bg-mist">
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
