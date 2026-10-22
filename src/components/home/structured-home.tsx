import Image from 'next/image';
import Link from 'next/link';
import { PurposeBlocks } from '@/components/about/purpose-blocks';
import { pillars } from '@/components/home/capabilities';
import { PillarsTabs } from '@/components/home/pillars-tabs';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { metrics } from '@/data/seed';
import { getSite } from '@/lib/site';

/**
 * The 'structured' home page: after the hero, a calm run of sections in one rhythm, each a contained block with
 * generous space around it. Stats band, what we do, the film (full width), the four pillars in a soft panel,
 * mission / vision / aim in their colours, testimonials, questions, and a closing call to action.
 */

const green = 'bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)]';
const lift = 'shadow-[0_24px_48px_-24px_rgb(11_21_16/0.35)]';

/** Faint concentric circles in a corner, as on the figures band and the closing panel. */
const Rings = ({ className = 'border-white/10' }: { className?: string }) => (
  <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10">
    {[260, 380, 500].map((s) => (
      <span key={s} className={`absolute right-0 top-0 rounded-full border ${className}`} style={{ width: s, height: s, transform: `translate(${(s - 260) / 2}px, -${(s - 260) / 2}px)` }} />
    ))}
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => <p className="inline-block w-fit bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{children}</p>;

/** The figures, in a contained green band. */
export function StatsBand() {
  return (
    <section aria-label="Flokefama in numbers" className="bg-paper pt-16 md:pt-24">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className={`relative isolate overflow-hidden ${green} text-white`}>
          <Rings />
          <ul className="grid divide-y divide-white/15 text-center md:grid-cols-3 md:divide-x md:divide-y-0">
            {metrics.slice(0, 2).map((m, i) => (
              <li key={m.label} className="px-6 py-10 md:py-14">
                <p className="text-[clamp(2.75rem,2rem+2.4vw,4rem)] font-bold leading-none tracking-[-0.04em]">
                  <CountUp value={m.value} suffix={m.suffix} />
                </p>
                <p className="mt-3 text-white/80">{i === 0 ? 'Hospitals and laboratories served' : 'Successful system integrations'}</p>
              </li>
            ))}
            <li className="px-6 py-10 md:py-14">
              <p className="text-[clamp(2.75rem,2rem+2.4vw,4rem)] font-bold leading-none tracking-[-0.04em]">No.1</p>
              <p className="mt-3 text-white/80">
                Healthcare sector, Ghana Club 100 ·{' '}
                <Link href="/awards" className="font-medium text-white underline underline-offset-4 hover:text-white/80">
                  Awards
                </Link>
              </p>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** What we do: the photo on a soft green panel with two small cards on it, the text on the right. */
export function WhatWeDo() {
  return (
    <section aria-labelledby="what-we-do" className="bg-paper section-y">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative bg-brand-50 p-8 md:p-12">
          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
          </div>
          <div className={`absolute -right-3 top-6 flex items-center gap-3 bg-white px-4 py-3 md:-right-6 ${lift}`}>
            <span className="grid size-8 place-items-center bg-brand-50 text-brand-700">
              <Icon name="fi-rr-check" />
            </span>
            <span className="text-sm font-semibold text-ink">Installed &amp; calibrated</span>
          </div>
          <div className={`absolute -left-3 bottom-8 flex items-center gap-3 bg-white px-4 py-3 md:-left-6 ${lift}`}>
            <span className="grid size-8 place-items-center bg-brand-50 text-brand-700">
              <Icon name="fi-rr-check" />
            </span>
            <span className="text-sm font-semibold text-ink">Maintained for life</span>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Chip>What we do</Chip>
          <h2 id="what-we-do" className="display mt-4 text-[clamp(2rem,1.2rem+2.4vw,3rem)] text-ink">
            At Flokefama Limited, we go beyond just supplying medical equipment
          </h2>
          <p className="no-justify mt-5 text-lg leading-relaxed text-ink-3">
            We offer a <strong className="font-semibold text-ink-2">comprehensive range of services</strong> designed to ensure{' '}
            <strong className="font-semibold text-ink-2">efficiency, reliability, and long-term value</strong> for healthcare facilities. Our expert team provides{' '}
            <strong className="font-semibold text-ink-2">end-to-end solutions</strong>, from procurement and installation to training and maintenance, ensuring that our clients get the most out of their
            investment.
          </p>
          <Button asChild arrow="right" className="mt-8">
            <Link href="/about">About us</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/** The four pillars: the heading beside its introduction, then a list to pick a pillar and the chosen one shown large. */
export function PillarsPanel() {
  return (
    <section aria-labelledby="pillars-title" className="pattern-cross pattern-tr bg-canvas section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <Chip>Our solutions</Chip>
            <h2 id="pillars-title" className="display mt-4 text-[clamp(2rem,1.2rem+2.4vw,3rem)] text-ink">
              Four pillars of medical infrastructure
            </h2>
          </div>
          <div>
            <p className="no-justify text-lg leading-relaxed text-ink-3">From diagnostics to delivery: one partner for the equipment, the engineers and the supplies that keep it running.</p>
            <Button asChild arrow="right" className="mt-6">
              <Link href="/services">Explore solutions</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="mt-12 md:mt-14">
          <PillarsTabs pillars={pillars} />
        </Reveal>
      </div>
    </section>
  );
}

/** Mission, vision and aim under one heading, in their own colours (green, red, teal), as before. */
export function PurposeCards() {
  return (
    <section aria-labelledby="purpose-title" className="bg-paper pb-16 md:pb-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Chip>Our purpose</Chip>
          <h2 id="purpose-title" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
            Why we do what we do
          </h2>
          <p className="mt-4 text-lg text-ink-3">Saving lives since 2008, and building healthcare capacity in Ghana for the decades ahead.</p>
        </Reveal>
        <PurposeBlocks className="mt-12" />
      </div>
    </section>
  );
}

/** Questions: the heading and a way to reach sales on the left, the questions (all of them, numbered) on the right. */
export async function HomeFaq() {
  const { faqs, contact } = await getSite();
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="home-faq" className="bg-paper section-y">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Chip>FAQ</Chip>
          <h2 id="home-faq" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
            Questions before you order
          </h2>
          <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">Still unsure? Our sales team will help you choose the right equipment for your facility.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href={contact.phoneHref} className="group flex items-center gap-3 bg-canvas px-5 py-4 transition-colors hover:bg-brand-50">
              <Icon name="fi-rr-phone-call" className="text-xl text-brand-700" />
              <span>
                <span className="block text-sm text-ink-3">Call sales</span>
                <span className="block font-semibold text-ink">{contact.phone}</span>
              </span>
            </a>
            <a href={`${contact.whatsapp}?text=${encodeURIComponent('Hello Flokefama, I have a question before ordering.')}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-canvas px-5 py-4 transition-colors hover:bg-brand-50">
              <Icon name="fi-brands-whatsapp" className="text-xl text-[#1da851]" />
              <span>
                <span className="block text-sm text-ink-3">Chat with us</span>
                <span className="block font-semibold text-ink">WhatsApp</span>
              </span>
            </a>
          </div>
        </Reveal>
        <ol className="space-y-3">
          {faqs.map((f, i) => (
            <li key={f.q}>
              <Reveal delay={Math.min(i, 4) * 0.04}>
                <details className="group bg-canvas transition-colors open:bg-brand-50" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center gap-5 px-6 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="text-sm font-semibold tabular-nums text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-lg font-semibold text-ink">{f.q}</span>
                    <span className="grid size-9 shrink-0 place-items-center bg-white text-ink transition-colors group-open:bg-brand-700 group-open:text-white">
                      <Icon name="fi-rr-plus-small" className="text-xl transition-transform group-open:rotate-45" />
                    </span>
                  </summary>
                  <p className="no-justify px-6 pb-6 pl-[3.85rem] leading-relaxed text-ink-3">
                    {f.a}{' '}
                    {f.link && (
                      <Link href={f.link.href} className="font-medium text-brand-700 underline underline-offset-4">
                        {f.link.label}
                      </Link>
                    )}
                  </p>
                </details>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Closing call to action: a full-width green band with the claim, the two next steps and three products rising from the bottom. */
export function ClosingCta() {
  const products = [
    { src: '/images/products/auto-heamatology-analyzer-bc5150.webp', alt: 'Mindray BC-5150 haematology analyser' },
    { src: '/images/products/patient-monitor-comen.webp', alt: 'Comen patient monitor' },
    { src: '/images/products/autoclave-machine-35l.webp', alt: 'Autoclave machine, 35 litres' },
  ];
  return (
    <section aria-labelledby="closing-cta" className={`relative isolate overflow-hidden ${green} text-white`}>
      <Rings />
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pt-16 md:px-10 md:pt-24 lg:grid-cols-[1fr_1.1fr] lg:pt-0">
        <Reveal className="lg:py-24">
          <h2 id="closing-cta" className="display text-[clamp(2.25rem,1.4rem+2.6vw,3.5rem)] text-white">
            Equip your facility with Ghana’s No.1 healthcare company<span className="text-signal">.</span>
          </h2>
          <p className="no-justify mt-5 max-w-xl text-lg leading-relaxed text-white/80">Tell us what you need and our team will send a technical proposal, with installation, training and support included.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" arrow="right" className="bg-white text-brand-800 hover:bg-white/90">
              <Link href="/quote">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact us</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="grid grid-cols-3 items-end gap-3 self-end">
          {products.map((p, i) => (
            <div key={p.src} className={`relative bg-white ${i === 1 ? 'h-[260px] md:h-[340px]' : 'h-[200px] md:h-[260px]'}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 220px, 33vw" className="object-contain p-4 md:p-6" />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
