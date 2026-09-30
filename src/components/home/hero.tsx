import Image from 'next/image';
import Link from 'next/link';
import { MetricsTracker } from '@/components/home/metrics-tracker';
import { MoleculeCanvas } from '@/components/home/molecule-canvas';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { clients, distributors } from '@/data/seed';
import type { Metric } from '@/lib/types';

export function Hero({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-midnight pt-20 text-white/70">
      {/* Ambient layers */}
      <div className="grid-fade absolute inset-0 -z-10" />
      <div className="absolute -right-40 -top-40 -z-10 size-[720px] rounded-full bg-[radial-gradient(circle,rgb(31_157_87/0.35),transparent_65%)] blur-2xl" />
      <div className="absolute -bottom-60 -left-40 -z-10 size-[560px] rounded-full bg-[radial-gradient(circle,rgb(21_32_48/0.9),transparent_70%)]" />

      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1280px] items-center gap-14 px-5 pb-16 pt-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <div>
          <Reveal>
            <p className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-xs text-white">
              <span className="relative flex size-2 items-center justify-center"><span className="size-2 rounded-full bg-signal" /></span>
              Ghana Club 100 · Saving lives since 2008
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display mt-8 text-[clamp(2.9rem,1.3rem+5vw,5.6rem)] text-white">
              The backbone of West African <span className="text-gradient">diagnostics.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-xl text-lg font-light leading-relaxed md:text-xl">
              World-class laboratory and medical technology, supplied, installed and supported by engineers who stay with you for the life of every system.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="glow" size="lg">
              <Link href="/quote">
                Request a quote <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/quote?intent=demo">Schedule a demonstration</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-14 border-t border-white/10 pt-6">
              <p className="label !text-white/35">Official distributor</p>
              <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg font-semibold tracking-tight text-white/85">
                {distributors.map((d, i) => (
                  <li key={d} className="flex items-center gap-6">
                    {i > 0 && <span className="size-1 rounded-full bg-surgical-300/60" aria-hidden />}
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="relative isolate mt-24 lg:mt-32">
          <MoleculeCanvas className="absolute -right-10 -top-44 -z-10 size-[380px] sm:size-[460px] lg:-right-24 lg:-top-64 lg:size-[600px]" />
          <MetricsTracker metrics={metrics} />
        </div>
      </div>

      {/* Client marquee */}
      <div className="relative border-t border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex gap-14 pr-14" aria-hidden={copy === 1}>
              {clients.map((c) => (
                <li key={c.name} className="flex items-center gap-3 whitespace-nowrap text-sm text-white/55">
                  <Image src={c.logo} alt={copy === 0 ? c.name : ''} width={40} height={40} className="size-10 rounded-full bg-white object-contain p-1" />
                  {c.name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
