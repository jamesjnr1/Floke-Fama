import Image from 'next/image';
import Link from 'next/link';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import type { Metric } from '@/lib/types';

/**
 * Impact, not inventory: the published figures, then the stories behind them.
 * Every story is sourced (Flokefama’s own Media Centre and awards, or press coverage).
 */
const stories = [
  {
    kicker: 'Installation · UGMC',
    title: 'A $100,000+ analyser, installed at UGMC.',
    body: 'A Mindray M680 at the University of Ghana Medical Centre, expanding its diagnostic capacity.',
    source: 'Reported by Citi Newsroom',
    logo: { src: '/images/partners/ugmc.webp', w: 800, h: 468 },
  },
  {
    kicker: 'Ghana Club 100 · 2024',
    title: 'Ranked No.1 in the Healthcare sector.',
    body: 'First among healthcare companies at the 21st Ghana Club 100 Awards (GIPC).',
    source: 'GIPC certificate',
    href: '/awards',
  },
  {
    kicker: 'Education · UG',
    title: 'Shaping the next generation of biomedical engineers.',
    body: 'A partnership with the School of Engineering that brings real equipment and engineers into training.',
    source: 'Flokefama Media Centre, March 2026',
    href: '/events#news',
  },
  {
    kicker: 'Patient safety',
    title: 'Quality is tested, not assumed.',
    body: 'Analysers, reagents and IVD kits are verified before delivery.',
    source: 'Flokefama Media Centre',
    href: '/esg',
  },
];

export function Impact({ metrics }: { metrics: Metric[] }) {
  return (
    <section id="impact" className="scroll-mt-28 relative isolate overflow-hidden bg-midnight py-14 text-white md:py-20">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.25),transparent_65%)]" />
        <div className="grid-fade absolute inset-0 opacity-40" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <h2 className="display max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)] text-white">Equipping the labs and wards <span className="text-accent">that care for Ghana.</span></h2>
          </div>
        </Reveal>

        {/* The figures */}
        <Reveal delay={0.08}>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:mt-10 lg:grid-cols-4">
            {metrics.slice(0, 4).map((m) => (
              <div key={m.label} className="flex flex-col-reverse justify-end gap-2 bg-midnight p-5 md:p-6">
                <dt className="text-sm leading-snug">
                  <span className="block text-white">{m.label}</span>
                  {m.caption && <span className="text-white/65">{m.caption}</span>}
                </dt>
                <dd className="text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">
                  <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* The stories behind them */}
        <ul className="swipe-row mt-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {stories.map((s, i) => {
            const card = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <p className="label !text-[0.9375rem] !text-brand-300">{s.kicker}</p>
                  {s.logo && (
                    <span className="grid h-10 w-14 shrink-0 place-items-center rounded-xl bg-white p-1.5">
                      <Image src={s.logo.src} alt="" width={s.logo.w} height={s.logo.h} className="h-full w-auto object-contain" />
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug tracking-[-0.01em] text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{s.body}</p>
                <p className="mt-auto flex items-center gap-2 pt-4 text-xs text-white/65">
                  {s.source}
                  {s.href && <Icon name="fi-rr-arrow-small-right" className="ml-auto text-base text-brand-300 transition-transform group-hover:translate-x-1" />}
                </p>
              </>
            );
            const cls = 'group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition duration-500 md:p-6';
            return (
              <li key={s.title}>
                <Reveal delay={0.05 * i} className="h-full">
                  {s.href ? (
                    <Link href={s.href} className={`${cls} hover:border-brand-400/40 hover:bg-white/[0.06]`}>{card}</Link>
                  ) : (
                    <article className={cls}>{card}</article>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
