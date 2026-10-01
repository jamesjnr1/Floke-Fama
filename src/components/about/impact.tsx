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
    kicker: 'Installation · University of Ghana Medical Centre',
    title: 'A $100,000+ immunochemistry analyser, installed at UGMC.',
    body: 'Flokefama installed a Mindray M680 immunochemistry analyser at the University of Ghana Medical Centre under a placement package, expanding the hospital’s diagnostic capacity.',
    source: 'Reported by Citi Newsroom',
    logo: { src: '/images/partners/ugmc.webp', w: 800, h: 468 },
  },
  {
    kicker: 'Recognition · Ghana Club 100, 2024',
    title: 'Ranked No.1 in the Healthcare sector.',
    body: 'The Ghana Investment Promotion Centre ranked Flokefama first among healthcare companies at the 21st Ghana Club 100 Awards.',
    source: 'GIPC certificate',
    href: '/awards',
  },
  {
    kicker: 'Education · University of Ghana',
    title: 'Shaping the next generation of biomedical engineers.',
    body: 'A partnership with the School of Engineering, featured in its newsletter, that brings real equipment and real engineers into training.',
    source: 'Flokefama Media Centre, March 2026',
    href: '/events#news',
  },
  {
    kicker: 'Patient safety',
    title: 'Quality is tested, not assumed.',
    body: 'Analysers, reagents and IVD kits are verified before delivery, because every result informs a clinical decision.',
    source: 'Flokefama Media Centre',
    href: '/esg',
  },
];

export function Impact({ metrics }: { metrics: Metric[] }) {
  return (
    <section id="impact" className="scroll-mt-28 relative isolate overflow-hidden bg-midnight py-24 text-white md:py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 size-[700px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.25),transparent_65%)]" />
        <div className="grid-fade absolute inset-0 opacity-40" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label !text-brand-300">Our impact</p>
          <h2 className="display mt-4 max-w-4xl text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)] text-white">
            Equipping the labs and wards <span className="text-gradient">that care for Ghana.</span>
          </h2>
        </Reveal>

        {/* The figures */}
        <Reveal delay={0.08}>
          <dl className="mt-10 grid md:mt-16 grid-cols-2 gap-px overflow-hidden rounded-4xl border border-white/10 bg-white/10 lg:grid-cols-4">
            {metrics.slice(0, 4).map((m, i) => (
              <div key={m.label} className="flex flex-col-reverse justify-end gap-3 bg-midnight p-6 md:p-8">
                <dt className="text-sm leading-snug">
                  <span className="block text-white">{m.label}</span>
                  {m.caption && <span className="text-white/40">{m.caption}</span>}
                </dt>
                <dd className={i === 0 ? 'text-gradient text-5xl font-bold tracking-[-0.04em] md:text-7xl' : 'text-5xl font-bold tracking-[-0.04em] text-white md:text-7xl'}>
                  <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* The stories behind them */}
        <ul className="swipe-row mt-6 gap-4 md:grid-cols-2">
          {stories.map((s, i) => {
            const card = (
              <>
                <div className="flex items-start justify-between gap-6">
                  <p className="label !text-brand-300">{s.kicker}</p>
                  {s.logo ? (
                    <span className="grid h-14 w-20 shrink-0 place-items-center rounded-2xl bg-white p-2">
                      <Image src={s.logo.src} alt="" width={s.logo.w} height={s.logo.h} className="h-full w-auto object-contain" />
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-white/10">{String(i + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <h3 className="mt-6 text-2xl font-bold leading-tight tracking-[-0.02em] text-white md:text-[1.75rem]">{s.title}</h3>
                <p className="mt-3 font-light leading-relaxed text-white/60">{s.body}</p>
                <p className="mt-auto flex items-center gap-2 pt-6 text-xs text-white/40">
                  <span className="size-1.5 rounded-full bg-brand-400" aria-hidden /> {s.source}
                  {s.href && <Icon name="fi-rr-arrow-small-right" className="ml-auto text-base text-brand-300 transition-transform group-hover:translate-x-1" />}
                </p>
              </>
            );
            const cls = 'group flex h-full flex-col rounded-4xl border border-white/10 bg-white/[0.04] p-7 transition duration-500 md:p-9';
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
