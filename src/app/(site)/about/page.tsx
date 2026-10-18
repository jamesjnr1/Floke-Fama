import type { Metadata } from 'next';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import { CeoProfile } from '@/components/about/ceo-profile';
import { CeoFeature } from '@/components/about/ceo-feature';
import { ceoStyle } from '@/lib/ceo-style';
import Image from 'next/image';
import Link from 'next/link';
import { Branches } from '@/components/about/branches';
import { CoreValues } from '@/components/about/core-values';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Cog, Gauge, GraduationCap, Settings, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { ToneIcon } from '@/components/ui/tone-icon';
import { brochureUrl } from '@/data/seed';
import { getSite } from '@/lib/site';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Founded in 2008, Flokefama delivers world-class healthcare equipment across Ghana and West Africa. Our story, mission, vision and core values.',
  alternates: { canonical: '/about' },
};

const briefIcons = [
  { icon: ShoppingCart, tone: 'green' },
  { icon: Settings, tone: 'teal' },
  { icon: ShieldCheck, tone: 'blue' },
  { icon: Cog, tone: 'amber' },
  { icon: Gauge, tone: 'red' },
  { icon: GraduationCap, tone: 'teal' },
] as const;

export default async function AboutPage() {
  const { servicesInBrief, ceo } = await getSite();
  return (
    <>
      <SitePageHero page="about" />

      {/* Mission, vision and aim: three bold blocks right under the header, as on the current site */}
      <section id="mission" className="scroll-mt-28 bg-paper pt-12 md:pt-20">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <PurposeBlocks />
        </div>
      </section>

      {/* Who we are */}
      <section id="who-we-are" className="pattern-grid scroll-mt-28 bg-paper section-y">
        {/* The heading across the top; under it the text and actions on the left, the head-office photo larger on the right, both starting on the same line */}
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="display max-w-[24ch] text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Redefining healthcare delivery in Ghana and across Africa.</h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-start lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="space-y-4 text-lg leading-relaxed text-ink-3">
                <p>
                  <strong className="font-semibold text-ink">FLOKEFAMA LIMITED</strong>, founded in 2008, is a registered company specializing in delivering world-class healthcare equipment across Ghana and West Africa.
                </p>
                <p>
                  With a strong presence in both the private and public sectors, we represent diverse medical equipment manufacturers, bringing innovative technology to our clients and contributing significantly to the development of healthcare in the markets we serve.
                </p>
                <p>As a trusted healthcare solutions provider and a Ghana Club 100 company, we focus on standardization, accessibility, and innovation in healthcare systems.</p>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Button asChild className="w-full justify-between"><a href={brochureUrl} download>Download Our Brochure <Icon name="fi-rr-download" /></a></Button>
                <Button asChild variant="outline" arrow="right" className="w-full justify-between"><Link href="/services">See Our Products &amp; Services</Link></Button>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <figure className="relative aspect-[4/3] overflow-hidden bg-midnight">
                <Image src="/images/office-team.webp" alt="Inside the Flokefama head office: the ‘Together we do great things’ wall" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                <figcaption className="absolute bottom-4 left-4 bg-paper/90 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur">Head office · Santa Maria, Accra</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Leadership. Portrait from the current site's media library; the profile is the CEO's own text (Oct 2026). */}
      {ceoStyle === 'feature' ? (
        <CeoFeature ceo={ceo} />
      ) : (
      <section id="ceo" className="scroll-mt-28 border-y border-line bg-canvas section-y">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:items-start lg:gap-16">
          <Reveal className="lg:col-span-5">
            <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-lg bg-[#e9e6e3] lg:max-w-none">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </figure>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Meet our CEO</h2>
            <p className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink">{ceo.name}</p>
            <p className="mt-1 font-mono text-sm uppercase tracking-wider text-brand-700">{ceo.role}</p>
            <div className="mt-8">
              <CeoProfile ceo={ceo} />
            </div>
          </Reveal>
        </div>
      </section>
      )}

      {/* Our services (content from the current About page) */}
      <section id="experience" className="pattern-dots pattern-tr scroll-mt-28 bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          {/* Our services: heading and intro stacked, then the cards */}
          <Reveal>
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Our Services</h2>
            <p className="no-justify mt-4 max-w-3xl text-lg leading-relaxed text-ink-3">
              FLOKEFAMA LTD offers an extensive range of high-quality medical equipment, services, and supplies. Our dedicated team works closely with customers to develop tailored solutions that reduce costs and enhance healthcare delivery.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {servicesInBrief.map((x, i) => (
              <li key={x.title} className="bg-paper">
                <Reveal delay={(i % 3) * 0.05} className="flex h-full flex-col p-7 lg:p-9">
                  <div className="flex items-start justify-between">
                    <ToneIcon icon={briefIcons[i].icon} tone={briefIcons[i].tone} />
                    <span className="font-mono text-sm text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h4 className="mt-6 text-xl font-bold tracking-[-0.01em] text-ink">{x.title}</h4>
                  <p className="mt-2 text-[1.125rem] leading-relaxed text-ink-3">{x.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              See Our Products &amp; Services
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Core values */}
      <section id="values" className="pattern-cross pattern-bl scroll-mt-28 bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-ink">The principles that define who we are.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">At Flokefama Limited, our success is built on a strong foundation of core values that guide every aspect of our operations. These principles define who we are, how we work, and the impact we strive to make in the healthcare industry.</p>
          </Reveal>
          <CoreValues />
        </div>
      </section>

      <Branches />
    </>
  );
}
