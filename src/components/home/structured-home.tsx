import Image from 'next/image';
import Link from 'next/link';
import { pillars } from '@/components/home/capabilities';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { metrics } from '@/data/seed';
import { getSite } from '@/lib/site';

/**
 * The 'structured' home page: after the hero, a calm run of sections in one rhythm, each a contained block with
 * generous space around it. Stats band, two alternating features (what we do, the film), the four pillars in a
 * soft panel, mission / vision / aim as two cards, testimonials, questions, and a closing call to action.
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

/** The four pillars in one soft panel: the introduction on the left, the pillars two by two on the right. */
export function PillarsPanel() {
  return (
    <section aria-labelledby="pillars-title" className="bg-paper pb-16 md:pb-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="relative isolate grid gap-10 overflow-hidden bg-canvas p-8 md:p-14 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <Rings className="border-brand-700/10" />
          <div className="flex flex-col">
            <Chip>Our solutions</Chip>
            <h2 id="pillars-title" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
              Four pillars of medical infrastructure
            </h2>
            <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">From diagnostics to delivery: one partner for the equipment, the engineers and the supplies that keep it running.</p>
            <Button asChild arrow="right" className="mt-8 w-fit lg:mt-auto">
              <Link href="/services">Explore solutions</Link>
            </Button>
          </div>
          <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <li key={p.title}>
                <Link href={p.href} className="group block">
                  <span className="text-sm font-semibold tabular-nums text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-ink group-hover:text-brand-700">{p.title}</h3>
                  <p className="no-justify mt-2 leading-relaxed text-ink-3">{p.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** Mission on a white card; vision and aim side by side on a wider green card. */
export async function PurposeCards() {
  const { purpose } = await getSite();
  const mission = purpose.find((p) => p.label === 'Mission') ?? purpose[0];
  const others = purpose.filter((p) => p !== mission);
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
        <div className="mx-auto mt-12 grid max-w-[1080px] gap-5 lg:grid-cols-[1fr_1.7fr]">
          {mission && (
            <Reveal className={`flex flex-col border border-line bg-white p-8 md:p-10 ${lift}`}>
              <Icon name={mission.icon} className="text-3xl text-brand-700" />
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">Our {mission.label}</h3>
              <p className="no-justify mt-3 text-[1.0625rem] leading-relaxed text-ink-3">{mission.text}</p>
            </Reveal>
          )}
          <Reveal delay={0.08} className={`relative isolate grid overflow-hidden ${green} text-white sm:grid-cols-2`}>
            <Rings />
            {others.map((p, i) => (
              <div key={p.label} className={`p-8 md:p-10 ${i ? 'border-t border-white/15 sm:border-l sm:border-t-0' : ''}`}>
                <Icon name={p.icon} className="text-3xl text-brand-300" />
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-white">Our {p.label}</h3>
                <p className="no-justify mt-3 text-[1.0625rem] leading-relaxed text-white/80">{p.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** The buying questions, as a short centred list that opens one answer at a time. */
export async function HomeFaq() {
  const { faqs } = await getSite();
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="home-faq" className="bg-paper section-y">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <Chip>FAQ</Chip>
          <h2 id="home-faq" className="display mt-4 text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
            Questions before you order
          </h2>
        </Reveal>
        <ul className="mt-10 space-y-3">
          {faqs.slice(0, 5).map((f, i) => (
            <li key={f.q}>
              <details className="group bg-canvas px-6 py-5 open:pb-6" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="fi-rr-plus-small" className="shrink-0 text-xl text-ink-3 transition-transform group-open:rotate-45" />
                </summary>
                <p className="no-justify mt-3 leading-relaxed text-ink-3">
                  {f.a}{' '}
                  {f.link && (
                    <Link href={f.link.href} className="font-medium text-brand-700 underline underline-offset-4">
                      {f.link.label}
                    </Link>
                  )}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Closing call to action: a soft green panel with the two next steps and a product on a card. */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-cta" className="bg-paper pb-16 md:pb-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="relative isolate grid items-center gap-10 overflow-hidden bg-brand-50 p-8 md:p-14 lg:grid-cols-[1.2fr_1fr]">
          <Rings className="border-brand-700/10" />
          <div>
            <h2 id="closing-cta" className="display text-[clamp(2rem,1.2rem+2.2vw,2.75rem)] text-ink">
              Equip your facility with Ghana’s No.1 healthcare company
            </h2>
            <p className="no-justify mt-4 max-w-xl text-lg leading-relaxed text-ink-3">Tell us what you need and our team will send a technical proposal, with installation, training and support included.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild arrow="right">
                <Link href="/quote">Request a quote</Link>
              </Button>
              <Button asChild variant="red" arrow="right">
                <Link href="/support">Contact us</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm pb-6 pl-6">
            <div className={`relative aspect-square bg-white ${lift}`}>
              <Image src="/images/products/patient-monitor-comen.webp" alt="Comen patient monitor" fill sizes="384px" className="object-contain p-8" />
            </div>
            <div className={`absolute bottom-0 left-0 bg-white px-5 py-4 ${lift}`}>
              <p className="text-2xl font-bold leading-none tracking-[-0.03em] text-brand-700">700+</p>
              <p className="mt-1 text-sm text-ink-3">hospitals &amp; labs served</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
