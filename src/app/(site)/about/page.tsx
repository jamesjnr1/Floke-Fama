import type { Metadata } from 'next';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import Image from 'next/image';
import Link from 'next/link';
import { CoreValues } from '@/components/about/core-values';
import { Impact } from '@/components/about/impact';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/motion/count-up';
import { Icon, IconTile } from '@/components/ui/icon';
import { brochureUrl, experienceFigures, servicesInBrief } from '@/data/seed';
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
        title={<>Purveyor of excellence <span className="text-brand-600">in healthcare</span></>}
        lead="FLOKEFAMA is recognized as one of the most reputable and trusted medical equipment suppliers in Ghana."
      />

      {/* Mission, vision and aim: three bold blocks right under the header, as on the current site */}
      <section id="mission" className="scroll-mt-28 bg-paper pt-12 md:pt-20">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <PurposeBlocks />
        </div>
      </section>

      {/* Who we are */}
      <section id="who-we-are" className="scroll-mt-28 bg-paper py-14 md:py-32">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="label eyebrow">Who we are</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Redefining healthcare delivery in Ghana and across Africa.</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-3">
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

      {/* Leadership. Portrait from the current site's media library; facts and quotes from published
          interviews and press (Graphic Online, Citi Newsroom, Ghana CEO Summit, EMY Africa) and his podcast. */}
      <section id="ceo" className="scroll-mt-28 border-t border-line bg-paper py-14 md:py-24">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-5xl bg-[#e9e6e3] lg:max-w-none">
              <Image src="/images/ceo-emmanuel-kenney.webp" alt="Mr. Emmanuel Teye Kwabena Kenney, Chief Executive Officer of Flokefama" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
            </figure>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7">
            <p className="label eyebrow">Leadership</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Meet our CEO</h2>
            <p className="mt-6 text-xl font-semibold text-ink">Mr. Emmanuel Teye Kwabena Kenney</p>
            <p className="mt-1 text-[15px] text-brand-700">Chief Executive Officer, Flokefama Company Limited</p>
            <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-ink-3">
              <p>
                Flokefama began with a personal story. After surviving a near-death experience and an operation carried out with inadequate equipment, Mr. Kenney set out to make sure no Ghanaian has to depend on equipment that isn’t good enough. His belief is simple: “We can’t compromise on our health by using below standard medical technologies.”
              </p>
              <p>
                With more than 16 years in in-vitro diagnostics, he is an alumnus of St. Augustine’s College and Stanford Graduate School of Business, the host of the <span className="font-medium text-ink">Diagnostics and Beyond</span> podcast, and was named Man of the Year in Health at the 2024 EMY Africa Awards.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Industry experience and services (content from the current About page) */}
      <section id="experience" className="scroll-mt-28 border-t border-line bg-canvas py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <Reveal className="lg:col-span-7">
              <p className="label eyebrow">About us</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Industry Experience</h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-3">
                FLOKEFAMA is recognized as one of the most reputable and trusted medical equipment suppliers in Ghana. Our years of experience have enabled us to establish strong partnerships with leading medical clients across the nation, allowing us to deliver high-quality equipment tailored to meet specific needs. Whether it’s cutting-edge technology or reliable essentials, FLOKEFAMA is committed to fulfilling all medical equipment requirements with excellence.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-5">
              <dl className="grid grid-cols-2 gap-6 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-line">
                {experienceFigures.map((f) => (
                  <div key={f.label} className="flex flex-col-reverse gap-2 border-t border-line pt-5 lg:flex-row-reverse lg:items-center lg:justify-end lg:gap-6 lg:border-t-0 lg:py-7 lg:first:pt-0 lg:last:pb-0">
                    <dt className="text-[15px] text-ink-3 lg:text-lg">{f.label}</dt>
                    <dd className="text-[clamp(3rem,2rem+3vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-brand-600 lg:min-w-[2.2ch]">
                      <CountUp value={f.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-6 md:mt-24 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-5">
              <h3 className="display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)]">Our Services</h3>
            </Reveal>
            <Reveal delay={0.05} className="lg:col-span-7">
              <p className="leading-relaxed text-ink-3">
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
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-3">{x.text}</p>
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

      <Impact metrics={metrics} />

      {/* Core values */}
      <section id="values" className="scroll-mt-28 relative isolate overflow-hidden bg-canvas py-24 md:py-32">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(228_40_60/0.06),transparent_65%)]" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label eyebrow">Our core values</p>
            <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-ink">The principles that define who we are.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">At Flokefama Limited, our success is built on a strong foundation of core values that guide every aspect of our operations. These principles define who we are, how we work, and the impact we strive to make in the healthcare industry.</p>
          </Reveal>
          <CoreValues />
        </div>
      </section>

    </>
  );
}
