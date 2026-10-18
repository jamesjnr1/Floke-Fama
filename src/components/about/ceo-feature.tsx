import Image from 'next/image';
import { CeoFeatureTabs } from '@/components/about/ceo-feature-tabs';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';

type Ceo = SiteContent['ceo'];

/**
 * "Meet our CEO", the 'feature' style (see ceoStyle): a green band with the heading, his name and title (centred in
 * the band), the portrait on the right reaching below it. Under it: Profile, Education, Honours and Philanthropy & Purpose
 * behind four buttons, the text running the full width below the portrait.
 */
export function CeoFeature({ ceo }: { ceo: Ceo }) {
  return (
    <section id="ceo" aria-labelledby="ceo-title" className="pattern-dots pattern-bl scroll-mt-28 bg-canvas">
      <div className="bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pt-16 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-20">
          <Reveal className="lg:col-span-7 lg:pt-24">
            <h2 id="ceo-title" className="display text-[clamp(2.75rem,1.5rem+4vw,5rem)] !leading-[0.95] text-white">Meet our CEO</h2>
            <p className="mt-3 text-[clamp(1.5rem,1.2rem+1vw,2.125rem)] font-bold tracking-[-0.03em] text-white">{ceo.name}</p>
            <p className="mt-2 font-mono text-[clamp(0.9375rem,0.85rem+0.3vw,1.125rem)] uppercase tracking-wider text-[#9fdcbb]">{ceo.role}</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <figure className="relative mx-auto aspect-[4/5] max-w-md bg-[#e9e6e3] lg:-mb-40 lg:max-w-none">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </figure>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 lg:py-20">
        <Reveal>
          <CeoFeatureTabs ceo={ceo} />
        </Reveal>
      </div>
    </section>
  );
}
