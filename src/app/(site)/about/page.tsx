import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CoreValues } from '@/components/about/core-values';
import { Impact } from '@/components/about/impact';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon, IconTile } from '@/components/ui/icon';
import { purpose } from '@/data/seed';
import { getMetrics } from '@/lib/data';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Founded in 2008, Flokefama delivers world-class healthcare equipment across Ghana and West Africa. Our story, mission, vision and core values.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const metrics = await getMetrics();
  return (
    <>
      <PageHero
        label="About us"
        title={<>Purveyor of excellence <span className="text-gradient">in healthcare</span></>}
        lead="Recognised as one of the most reputable and trusted medical equipment suppliers in Ghana."
      />

      {/* Who we are */}
      <section id="who-we-are" className="scroll-mt-28 bg-paper py-14 md:py-32">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="label">Who we are</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Redefining healthcare delivery in Ghana and across Africa.</h2>
            <div className="mt-6 space-y-4 text-lg font-light leading-relaxed text-ink-3">
              <p>
                <strong className="font-semibold text-ink">Flokefama Limited</strong>, founded in 2008, is a registered company specialising in delivering world-class healthcare equipment across Ghana and West Africa.
              </p>
              <p>
                With a strong presence in both the private and public sectors, we represent diverse medical equipment manufacturers, bringing innovative technology to our clients and contributing significantly to the development of healthcare in the markets we serve.
              </p>
              <p>As a Ghana Club 100 company, we focus on standardisation, accessibility and innovation in healthcare systems.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/services">Our products &amp; services <Icon name="fi-rr-arrow-small-right" /></Link></Button>
              <Button asChild variant="outline"><Link href="/awards">View our awards</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <figure className="relative aspect-[4/3.6] overflow-hidden rounded-5xl bg-midnight">
              <Image src="/images/office-team.webp" alt="Inside the Flokefama head office: the ‘Together we do great things’ wall" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-paper/90 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur">Head office · Santa Maria, Accra</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <Impact metrics={metrics} />

      {/* Mission, vision, aim */}
      <section id="mission" className="scroll-mt-28 border-t border-line bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">Our mission</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">What we stand for.</h2>
          </Reveal>
          <ul className="swipe-row mt-10 gap-4 md:mt-12 md:grid-cols-3">
            {purpose.map((p, i) => (
              <li key={p.label}>
                <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-3xl border border-line bg-canvas p-7">
                  <IconTile name={p.icon} />
                  <p className="label mt-8">Our {p.label.toLowerCase()}</p>
                  <p className="mt-3 text-lg leading-relaxed text-ink">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Core values */}
      <section id="values" className="scroll-mt-28 relative isolate overflow-hidden bg-[linear-gradient(160deg,#005e31_0%,#004d28_55%,#003d20_100%)] py-24 text-white md:py-32">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(128_196_160/0.18),transparent_65%)]" />
        <div aria-hidden className="grid-fade absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label !text-brand-100">Our core values</p>
            <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-white">The principles that define who we are.</h2>
            <p className="mt-4 max-w-xl font-light leading-relaxed text-white/70">Our success is built on four values that guide how we work and the impact we make in healthcare.</p>
          </Reveal>
          <CoreValues />
        </div>
      </section>

    </>
  );
}
