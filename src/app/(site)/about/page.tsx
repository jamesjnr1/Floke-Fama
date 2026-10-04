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
import { Cog, Gauge, GraduationCap, Settings, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { ToneIcon } from '@/components/ui/tone-icon';
import { brochureUrl, experienceFigures, servicesInBrief } from '@/data/seed';
import { getMetrics } from '@/lib/data';

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

      {/* Leadership. Portrait from the current site's media library; text from the CEO profile supplied by Flokefama. */}
      <section id="ceo" className="gridlines-light scroll-mt-28 border-t border-line bg-paper py-14 md:py-24">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden bg-[#e9e6e3] lg:max-w-none">
                <Image src="/images/ceo-emmanuel-kenney.webp" alt="Mr. Emmanuel Kenney, Founder and Chief Executive Officer of Flokefama" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
                <span aria-hidden className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-brand-600" />
                <span aria-hidden className="absolute bottom-0 right-0 size-8 border-b-2 border-r-2 border-signal" />
              </figure>
              <blockquote className="mx-auto mt-6 max-w-md border-l-2 border-signal pl-5 text-lg font-semibold leading-snug text-ink lg:max-w-none">
                “Better healthcare should not be a privilege; it should be accessible, efficient and delivered with dignity and excellence.”
              </blockquote>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7">
            <p className="label eyebrow">Leadership</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Meet our CEO</h2>
            <p className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink">Mr. Emmanuel Kenney</p>
            <p className="mt-1 font-mono text-sm uppercase tracking-wider text-brand-700">Founder &amp; Chief Executive Officer, Flokefama Company Limited</p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-3">
              <p>Behind Flokefama’s vision is Mr. Emmanuel Kenney, a Ghanaian entrepreneur and business leader whose journey into the healthcare industry is deeply personal.</p>
              <p>
                Mr. Kenney brings a strong combination of academic preparation, leadership experience and entrepreneurial vision to his role as Chief Executive Officer. He is a graduate of Sanford Business School in the United States of America, where he developed a strong foundation in business management and leadership. He is also an alumnus of the prestigious St. Augustine’s College, Cape Coast, an institution renowned for academic excellence, discipline and leadership development.
              </p>
              <p>
                As the Founder and Chief Executive Officer of Flokefama Company Limited, Mr. Kenney has built the company around a simple but powerful conviction: better healthcare should not be a privilege, it should be accessible, efficient and delivered with dignity and excellence.
              </p>
              <p>
                His passion for healthcare was shaped in part by his own experience with surgery. Having personally experienced the challenges and difficulties associated with surgical care, he came away with a determination that others should not have to go through the same experience where better systems, technology and equipment could make a difference. That experience became one of the driving forces behind his commitment to improving healthcare delivery through access to modern medical equipment, technology and innovative solutions. Today, he leads Flokefama in providing world-class healthcare equipment and solutions across Ghana and West Africa.
              </p>
              <p>
                Since its establishment in 2008, Flokefama has grown into a multiple award-winning company, including Ghana Club 100 company, and has a reputation for quality, reliability and innovation in the healthcare sector. Under Mr. Kenney’s leadership, the company has also championed partnerships with academic and professional institutions to help develop industry-ready engineers and technical professionals capable of supporting and transforming Ghana’s healthcare infrastructure.
              </p>
            </div>
            <div className="mt-10 border border-line bg-canvas p-6 md:p-8">
              <h3 className="flex items-center gap-3 text-xl font-bold tracking-[-0.02em]">
                <span className="size-2 bg-signal" aria-hidden /> Business with a Purpose
              </h3>
              <div className="mt-4 space-y-4 leading-relaxed text-ink-3">
                <p>
                  Many a CEO will do business for money and prestige, but there are rare ones like Mr. Kenney who do it for the welfare of society and for a better healthcare system. His vision goes beyond selling medical equipment. He is passionate about helping healthcare institutions gain access to the technology, expertise and systems they need to provide safer, more efficient and more dignified care.
                </p>
                <p>For Mr. Kenney, business success is measured not only by financial performance, but also by the lives improved, the healthcare systems strengthened and the difference made in society.</p>
                <p>
                  His leadership continues to position Flokefama not simply as a healthcare equipment company, but as a partner in building a stronger, more responsive and technology-driven healthcare system for Ghana and the wider West African region.
                </p>
              </div>
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
                    <dt className="text-[1rem] text-ink-3 lg:text-lg">{f.label}</dt>
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
                    <ToneIcon icon={briefIcons[i].icon} tone={briefIcons[i].tone} />
                    <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h4 className="mt-8 text-lg font-semibold tracking-[-0.01em] text-ink">{x.title}</h4>
                  <p className="mt-2 text-[1rem] leading-relaxed text-ink-3">{x.text}</p>
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
