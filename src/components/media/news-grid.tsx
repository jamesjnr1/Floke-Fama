import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { articles } from '@/data/articles';
import { cn } from '@/lib/utils';

export const formatDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Media Centre: every news, blog and press post from flokefama.com, each opening its full article. */
export function NewsGrid() {
  return (
    <section id="news" className="scroll-mt-28 border-t border-line bg-canvas py-12 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label">Media centre · What’s new</p>
          <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">News, Blog &amp; Press</h2>
        </Reveal>
        <ul className="swipe-row mt-10 gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <li key={a.slug} className={cn(i === 0 && 'lg:col-span-2')}>
              <Reveal delay={Math.min(i, 5) * 0.05} className="h-full">
                <Link
                  href={`/news/${a.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]"
                >
                  {a.image && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-mist">
                      <Image src={a.image.src} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover object-top transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="label flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand-500" aria-hidden /> {a.categories.join(', ')} · {formatDate(a.date)}
                    </p>
                    <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.02em]">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-3">{a.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-brand-700">
                      Read more <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
