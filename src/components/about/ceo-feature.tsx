import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';

type Ceo = SiteContent['ceo'];

const label = 'text-[0.8125rem] font-semibold uppercase tracking-[0.14em]';

function List({ items }: { items: Ceo['education'] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((x) => (
        <li key={x.title} className="py-4">
          <p className="font-semibold text-ink">{x.title}</p>
          <p className="mt-0.5 text-[0.9375rem] text-ink-3">{x.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Meet our CEO", the 'feature' style (see ceoStyle): a green band with the heading, his creed, name and title, the
 * portrait on the right reaching below the band. Under it, on one grid: the profile on the left and his philanthropy
 * under the portrait; then education and honours side by side. Everything from his profile shows; nothing is in tabs.
 */
export function CeoFeature({ ceo }: { ceo: Ceo }) {
  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28 bg-canvas">
      <div className="bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pt-16 md:px-10 lg:grid-cols-12 lg:gap-16 lg:pt-24">
          <Reveal className="lg:col-span-7 lg:pb-24">
            <h2 id="ceo-title" className="display text-[clamp(2.5rem,1.4rem+3.6vw,4.75rem)] text-white">Meet our CEO</h2>
            <blockquote className="mt-8 border-l-[3px] border-[#7fd1a5] pl-5 text-[clamp(1.375rem,1.1rem+0.9vw,1.875rem)] font-semibold leading-snug tracking-[-0.02em] text-white/95">
              “{ceo.creed}”
            </blockquote>
            <p className="mt-10 text-2xl font-bold tracking-[-0.02em] text-white">{ceo.name}</p>
            <p className="mt-1.5 text-sm uppercase tracking-[0.08em] text-white/75">{ceo.role}</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <figure className="relative mx-auto aspect-[4/5] max-w-md bg-[#e9e6e3] lg:-mb-40 lg:max-w-none">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </figure>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className={`${label} text-brand-700`}>Profile</p>
            <div className="no-justify mt-5 space-y-5 text-lg leading-relaxed text-ink-3">
              {ceo.bio.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:pt-32">
            <p className={`${label} text-brand-700`}>Philanthropy &amp; Purpose</p>
            <p className="no-justify mt-5 text-[1.0625rem] leading-relaxed text-ink-3">{ceo.purpose}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 border-t border-line pt-14 md:grid-cols-2 lg:mt-20 lg:gap-16">
          <Reveal>
            <p className={`${label} mb-5 text-ink-3`}>Education</p>
            <List items={ceo.education} />
          </Reveal>
          <Reveal delay={0.06}>
            <p className={`${label} mb-5 text-ink-3`}>Honours</p>
            <List items={ceo.honours} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
