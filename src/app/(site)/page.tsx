import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { Capabilities } from '@/components/home/capabilities';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import { BeyondSupply } from '@/components/home/beyond-supply';
import { Testimonials } from '@/components/home/testimonials';
import { SolutionsInAction } from '@/components/home/solutions-in-action';
import { FeaturedNews } from '@/components/home/featured-news';
import { ClosingCta, PurposeCards, StatsBand, WhatWeDo } from '@/components/home/structured-home';

export const revalidate = 600;

export const metadata: Metadata = { alternates: { canonical: '/' } };

/**
 * Home layout after the hero. 'structured' (default): figures band, what we do, the full-width film, the four pillars,
 * mission / vision / aim, testimonials, featured news and a closing call to action, each a contained block.
 * 'classic': the earlier run of full-width sections. Switch with NEXT_PUBLIC_HOME_LAYOUT=classic in Vercel (then redeploy).
 */
const layout = process.env.NEXT_PUBLIC_HOME_LAYOUT === 'classic' ? 'classic' : 'structured';

/** Home: each section appears only here; services, contact and company detail live on their own pages. */
export default function HomePage() {
  if (layout === 'structured') {
    return (
      <>
        <Hero />
        <StatsBand />
        <WhatWeDo />
        <SolutionsInAction plain />
        {/* The original four pillars design, on the menu bar's deep forest-green gradient */}
        <Capabilities background="bg-[linear-gradient(100deg,#0b3d2a_0%,#0d4a33_45%,#0a3a28_75%,#072e20_100%)]" />
        <PurposeCards />
        <Testimonials />
        <FeaturedNews />
        <ClosingCta />
      </>
    );
  }
  return (
    <>
      <Hero />
      <SolutionsInAction />
      <Partners heading={false} logos={false} />
      <BeyondSupply />
      <section aria-label="Our mission, vision and aim" className="pattern-cross pattern-bl bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <PurposeBlocks />
        </div>
      </section>
      <Capabilities />
      <Testimonials />
    </>
  );
}
