import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';

type Ceo = SiteContent['ceo'];

const subhead = 'text-[clamp(1.5rem,1.25rem+0.8vw,2rem)] font-bold tracking-[-0.03em] text-ink';

function List({ items }: { items: Ceo['education'] }) {
  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {items.map((x) => (
        <li key={x.title} className="py-5">
          <p className="text-lg font-semibold text-ink">{x.title}</p>
          <p className="mt-1 text-base leading-relaxed text-ink-3">{x.detail}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Meet our CEO", the 'feature' style (see ceoStyle): a green band with the heading, his creed, name and title, the
 * portrait on the right reaching below the band. Under it, on one grid: his profile on the left and his philanthropy
 * under the portrait; then education and honours side by side. Everything from his profile shows; nothing is in tabs.
 */
export function CeoFeature({ ceo }: { ceo: Ceo }) {
  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28 bg-canvas">
      <div className="bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pt-16 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-20">
          <Reveal className="lg:col-span-7 lg:pb-20">
            <h2 id="ceo-title" className="display text-[clamp(2.75rem,1.5rem+4vw,5rem)] text-white">Meet our CEO</h2>
            <blockquote className="mt-8 max-w-[22ch] text-[clamp(1.625rem,1.25rem+1.2vw,2.375rem)] font-semibold leading-[1.2] tracking-[-0.025em] text-white">
              “{ceo.creed}”
            </blockquote>
            <div className="mt-10">
              <p className="text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] font-bold tracking-[-0.02em] text-white">{ceo.name}</p>
              <p className="mt-2 text-base font-medium uppercase tracking-[0.06em] text-[#9fdcbb]">{ceo.role}</p>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <figure className="relative mx-auto aspect-[4/5] max-w-md bg-[#e9e6e3] lg:-mb-40 lg:max-w-none">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </figure>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h3 className={subhead}>Profile</h3>
            <div className="no-justify mt-6 space-y-6 text-[1.1875rem] leading-[1.75] text-ink-2">
              {ceo.bio.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}
            </div>
          </Reveal>
          {/* Under the portrait (which reaches 10rem below the band) */}
          <Reveal delay={0.08} className="lg:col-span-5 lg:pt-[7.5rem]">
            <div className="bg-paper p-8 ring-1 ring-line">
              <h3 className={subhead}>Philanthropy &amp; Purpose</h3>
              <p className="no-justify mt-5 text-lg leading-[1.7] text-ink-2">{ceo.purpose}</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:mt-20 lg:gap-16">
          <Reveal>
            <h3 className={subhead}>Education</h3>
            <List items={ceo.education} />
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className={subhead}>Honours</h3>
            <List items={ceo.honours} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
