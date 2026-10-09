import type { Metadata } from 'next';
import { Hero } from '@/components/home/hero';
import { Partners } from '@/components/home/partners';
import { Capabilities } from '@/components/home/capabilities';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import { BeyondSupply } from '@/components/home/beyond-supply';
import { Testimonials } from '@/components/home/testimonials';
import { SolutionsInAction } from '@/components/home/solutions-in-action';

export const revalidate = 600;

export const metadata: Metadata = { alternates: { canonical: '/' } };

/** Home: each section appears only here; services, contact and company detail live on their own pages. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SolutionsInAction />
      <Partners heading={false} logos={false} />
      <BeyondSupply />
      <section aria-label="Our mission, vision and aim" className="bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <PurposeBlocks />
        </div>
      </section>
      <Capabilities />
      <Testimonials />
    </>
  );
}
