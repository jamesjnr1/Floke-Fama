import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CoreValues } from '@/components/about/core-values';
import { Impact } from '@/components/about/impact';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/motion/count-up';
import { Icon, IconTile } from '@/components/ui/icon';
import { brochureUrl, experienceFigures, purpose, servicesInBrief } from '@/data/seed';
import { getMetrics } from '@/lib/data';
import { cn } from '@/lib/utils';

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
        lead="FLOKEFAMA is recognized as one of the most reputable and trusted medical equipment suppliers in Ghana."
      />

      {/* Who we are */}
      <section id="who-we-are" className="scroll-mt-28 bg-paper py-14 md:py-32">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="label">Who we are</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Redefining healthcare delivery in Ghana and across Africa.</h2>
            <div className="mt-6 space-y-4 text-lg font-light leading-relaxed text-ink-3">
              <p>
                <strong className="font-semibold text-ink">FLOKEFAMA LIMITED</strong>, founded in 2008, is a registered company specializing in delivering world-class healthcare equipment across Ghana and West Africa.
              </p>
              <p>
                With a strong presence in both the private and public sectors, we represent diverse medical equipment manufacturers, bringing innovative technology to our clients and contributing significantly to the development of healthcare in the markets we serve.
              </p>
              <p>As a trusted healthcare solutions provider and a Ghana Club 100 company, we focus on standardization, accessibility, and innovation in healthcare systems.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><a href={brochureUrl} download>Download Our Brochure <Icon name="fi-rr-download" /></a></Button>
              <Button asChild variant="outline"><Link href="/services">See Our Products &amp; Services</Link></Button>
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

      {/* Industry experience and services (content from the current About page) */}
      <section id="experience" className="scroll-mt-28 border-t border-line bg-canvas py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <p className="label">About us</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Industry Experience</h2>
              <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-ink-3">
                FLOKEFAMA is recognized as one of the most reputable and trusted medical equipment suppliers in Ghana. Our years of experience have enabled us to establish strong partnerships with leading medical clients across the nation, allowing us to deliver high-quality equipment tailored to meet specific needs. Whether it’s cutting-edge technology or reliable essentials, FLOKEFAMA is committed to fulfilling all medical equipment requirements with excellence.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5">
              <div className="relative isolate h-full overflow-hidden rounded-4xl bg-midnight text-white">
                <div aria-hidden className="absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.35),transparent_65%)]" />
                <dl className="grid h-full min-h-56 grid-cols-2">
                  {experienceFigures.map((f, i) => (
                    <div key={f.label} className={cn('relative flex flex-col-reverse justify-start p-7 pt-24 md:p-9 md:pt-28', i > 0 && 'border-l border-white/10')}>
                      <dt className="mt-3 min-h-[2.5em] text-sm leading-tight text-white/65 lg:min-h-0">
                        <span aria-hidden className="absolute left-7 top-7 grid size-11 place-items-center rounded-xl bg-white/[0.08] text-lg text-brand-300 ring-1 ring-white/10 md:left-9 md:top-9">
                          <Icon name={i === 0 ? 'fi-rr-calendar' : 'fi-rr-handshake'} />
                        </span>
                        {f.label}
                      </dt>
                      <dd className="text-[clamp(3rem,2rem+3vw,4.5rem)] font-bold leading-none tracking-[-0.04em]">
                        <CountUp value={f.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-6 md:mt-24 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-5">
              <h3 className="display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)]">Our Services</h3>
            </Reveal>
            <Reveal delay={0.05} className="lg:col-span-7">
              <p className="font-light leading-relaxed text-ink-3">
                FLOKEFAMA LTD offers an extensive range of high-quality medical equipment, services, and supplies. Our dedicated team works closely with customers to develop tailored solutions that reduce costs and enhance healthcare delivery.
              </p>
            </Reveal>
          </div>
          <ul className="swipe-row mt-10 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicesInBrief.map((x, i) => (
              <li key={x.title}>
                <Reveal delay={Math.min(i, 5) * 0.05} className="group flex h-full flex-col rounded-4xl border border-line bg-paper p-7 transition duration-500 ease-out-expo hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_30px_60px_-34px_rgb(11_21_16/0.35)]">
                  <div className="flex items-start justify-between">
                    <IconTile name={x.icon} />
                    <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h4 className="mt-8 text-lg font-semibold tracking-[-0.01em] text-ink">{x.title}</h4>
                  <p className="mt-2 text-[15px] font-light leading-relaxed text-ink-3">{x.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700">
              See Our Products &amp; Services <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Impact metrics={metrics} />

      {/* Mission, vision, aim */}
      <section id="mission" className="scroll-mt-28 border-t border-line bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">Our mission</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">What we stand for</h2>
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
      <section id="values" className="scroll-mt-28 relative isolate overflow-hidden bg-[linear-gradient(160deg,#1b5e37_0%,#134228_55%,#0e3320_100%)] py-24 text-white md:py-32">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(143_209_169/0.18),transparent_65%)]" />
        <div aria-hidden className="grid-fade absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label !text-brand-100">Our core values</p>
            <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-white">The principles that define who we are.</h2>
            <p className="mt-4 max-w-2xl font-light leading-relaxed text-white/75">At Flokefama Limited, our success is built on a strong foundation of core values that guide every aspect of our operations. These principles define who we are, how we work, and the impact we strive to make in the healthcare industry.</p>
          </Reveal>
          <CoreValues />
        </div>
      </section>

    </>
  );
}
