import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';

type Ceo = SiteContent['ceo'];

/**
 * "Meet our CEO", the 'message' style (default, see ceoStyle): a short label with a rule before it, his profile in
 * plain paragraphs, then his creed as a quote with his name and title under it, set off by a green rule on the
 * left. The portrait stands tall on the right. Education, honours and his philanthropy (which follows from the creed) sit underneath in three columns.
 */
export function CeoMessage({ ceo }: { ceo: Ceo }) {
  const list = (title: string, items: Ceo['education']) => (
    <div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <ul className="mt-4 space-y-4">
        {items.map((x) => (
          <li key={x.title}>
            <p className="font-semibold text-ink">{x.title}</p>
            <p className="mt-0.5 leading-relaxed text-ink-3">{x.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28 bg-canvas section-y">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <p className="flex items-center gap-4 text-lg text-ink-2">
            <span aria-hidden className="h-0.5 w-12 bg-brand-600" />
            <span id="ceo-title">Meet our CEO</span>
          </p>
          <div className="no-justify mt-6 space-y-6 text-[1.125rem] leading-[1.75] text-ink-2">
            {ceo.bio.map((t) => (
              <p key={t.slice(0, 40)}>{t}</p>
            ))}
          </div>
          <figure className="mt-10 border-l-[3px] border-brand-600 pl-6 md:pl-8">
            <svg aria-hidden viewBox="0 0 48 36" className="h-9 w-12 text-brand-600" fill="currentColor">
              <path d="M0 36V21.6C0 9.6 6.2 2.4 18.6 0l2 4.8C13.4 7 10 11 9.6 16.8H19V36H0Zm27 0V21.6C27 9.6 33.2 2.4 45.6 0l2 4.8C40.4 7 37 11 36.6 16.8H46V36H27Z" />
            </svg>
            <blockquote className="mt-4 text-[clamp(1.25rem,1.05rem+0.6vw,1.625rem)] font-medium leading-snug text-ink">“{ceo.creed}”</blockquote>
            <figcaption className="mt-6">
              <span className="block text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] font-bold tracking-[-0.02em] text-ink">{ceo.name}</span>
              <span className="mt-1 block text-ink-3">{ceo.role}</span>
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e6e3]">
            <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
          </div>
        </Reveal>
      </div>
      <div className="mx-auto mt-16 grid max-w-[1280px] gap-12 px-5 md:mt-20 md:grid-cols-2 md:px-10 lg:grid-cols-3 lg:gap-16">
        <Reveal>{list('Education', ceo.education)}</Reveal>
        <Reveal delay={0.06}>{list('Honours', ceo.honours)}</Reveal>
        <Reveal delay={0.12}>
          <h3 className="text-lg font-bold text-ink">Philanthropy &amp; Purpose</h3>
          <p className="no-justify mt-4 leading-relaxed text-ink-3">{ceo.purpose}</p>
        </Reveal>
      </div>
    </section>
  );
}
