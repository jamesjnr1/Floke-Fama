import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { news } from '@/data/seed';
import { cn } from '@/lib/utils';

/** Media Centre stories. Full articles move into Sanity with the CMS migration. */
export function NewsGrid() {
  return (
    <section id="news" className="scroll-mt-28 border-t border-line bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label">Media centre · What’s new</p>
          <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Latest from Flokefama.</h2>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <li key={n.id} className={cn(i === 0 && 'lg:col-span-2')}>
              <Reveal delay={Math.min(i, 5) * 0.05} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]">
                  {n.image && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-midnight">
                      <Image src={n.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover object-top transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="label flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand-500" aria-hidden /> {n.kind} · {n.date}
                    </p>
                    <h3 className="mt-3 text-xl font-bold leading-snug tracking-[-0.02em]">{n.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-3">{n.summary}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
