import Image from 'next/image';
import Link from 'next/link';
import { Activity, Award, BadgeCheck, HeartPulse, Trophy } from 'lucide-react';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/** Recognition, from the Awards page and the press. */
const trust = [
  { icon: Award, label: 'Ghana Club 100', sub: 'No.1 in Healthcare', tone: 'text-[#f5b82e]' },
  { icon: BadgeCheck, label: 'Forbes Africa', sub: 'Featured 2026', tone: 'text-[#ff6b6b]' },
  { icon: Trophy, label: 'Mindray', sub: 'Best in IVD 2026', tone: 'text-brand-300' },
];

/**
 * Hero (the FLOKE_BOLT layout in the Flokefama colours): a deep Mirage → Deep Sea field with thin technical
 * gridlines and a faint ECG trace; the company line and actions on the left, the Mindray BS-240 in a
 * bracketed frame on the right, and the Partners & Clientele band across the bottom.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#10191e_0%,#16232a_40%,#0b3b40_72%,#10191e_100%)] text-white">
      <div aria-hidden className="gridlines-dark absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -right-32 top-1/4 -z-10 size-[600px] rounded-full bg-brand-500/15 blur-[120px]" />
      <div aria-hidden className="absolute bottom-1/3 left-1/4 -z-10 size-[420px] rounded-full bg-[#0d9ba8]/10 blur-[100px]" />
      <div aria-hidden className="absolute right-1/3 top-1/2 -z-10 size-[300px] rounded-full bg-signal/10 blur-[90px]" />

      {/* ECG trace */}
      <svg aria-hidden className="absolute inset-x-0 top-[38%] -z-10 h-32 w-full opacity-[0.12]" viewBox="0 0 1400 100" preserveAspectRatio="none">
        <path
          className="ecg-path"
          d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L310,50 L320,10 L330,90 L340,50 L600,50 L620,50 L630,30 L640,70 L650,50 L900,50 L920,50 L930,15 L940,85 L950,50 L1200,50 L1220,50 L1230,25 L1240,75 L1250,50 L1400,50"
          stroke="#7fd1a5"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-14 pt-32 md:px-10 md:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Reveal className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="flex items-center gap-2.5 border-l-2 border-brand-400 pl-3 font-mono text-xs uppercase tracking-[0.15em] text-brand-300">
              <span className="status-dot" aria-hidden />
              Ghana’s No.1 Healthcare Company
            </span>
            <span className="flex items-center gap-2 border-l-2 border-signal pl-3 font-mono text-xs uppercase tracking-[0.15em] text-[#ff8a8a]">
              <HeartPulse className="size-4" aria-hidden />
              Saving lives since 2008
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="text-[clamp(2.5rem,1.5rem+3vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
              Advancing Healthcare <br className="hidden sm:block" />
              Standardisation <br className="hidden sm:block" />
              <span className="text-brand-300">
                Across Africa<span className="text-signal">.</span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">
              Flokefama delivers precision medical equipment, in-vitro diagnostics and biomedical engineering support to hospitals and laboratories, redefining healthcare
              delivery with standardised, accessible and innovative solutions since 2008.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/quote">Request a Solution Proposal</Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link href="/products">Explore the Catalogue</Link>
            </Button>
          </Reveal>

          {/* Recognition: three cells divided by hairlines */}
          <Reveal delay={0.24}>
            <ul className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
              {trust.map(({ icon: Ico, label, sub, tone }) => (
                <li key={label} className="flex flex-col gap-2 bg-[#121d23]/90 px-4 py-4 sm:px-5">
                  <Ico className={`size-5 ${tone}`} strokeWidth={2} aria-hidden />
                  <span className="text-sm font-bold leading-tight text-white sm:text-base">{label}</span>
                  <span className="font-mono text-[0.75rem] uppercase tracking-wider text-white/60">{sub}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* The Mindray BS-240, in a bracketed frame */}
        <Reveal delay={0.2} className="relative mx-auto hidden w-full max-w-md lg:col-span-5 lg:block">
          <div className="relative aspect-square">
            <div aria-hidden className="absolute inset-0 border border-brand-300/20" />
            <div aria-hidden className="absolute -left-px -top-px size-8 border-l-2 border-t-2 border-brand-300" />
            <div aria-hidden className="absolute -bottom-px -right-px size-8 border-b-2 border-r-2 border-signal" />
            <div className="absolute inset-3 overflow-hidden bg-[radial-gradient(80%_60%_at_50%_40%,#1f3a3f,#121d23)]">
              <Image src="/images/bs-240-stage.webp" alt="Mindray BS-240 chemistry analyser" fill priority sizes="420px" className="object-cover object-[78%_50%]" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#10191e]/85 via-transparent to-transparent" />
            </div>

            <div className="absolute inset-x-6 bottom-6 border border-brand-300/25 bg-[#10191e]/70 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.75rem] uppercase tracking-wider text-brand-300">Official Mindray distributor</span>
                <span className="status-dot" aria-hidden />
              </div>
              <p className="mt-2 text-base font-bold leading-tight text-white">BS-240 Chemistry Analyser</p>
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 font-mono text-[0.75rem]">
                <span className="text-white/60">Support</span>
                <span className="font-semibold text-brand-300">Installation &amp; training</span>
              </div>
            </div>

            <span className="absolute -right-3 -top-3 border border-[#54cdd6]/30 bg-[#10191e]/80 px-3 py-2 font-mono text-[0.75rem] tracking-wider text-[#8fdde3] backdrop-blur">EST. 2008</span>
            <span className="absolute -bottom-3 -left-3 flex items-center gap-2 border border-signal/40 bg-[#10191e]/80 px-3 py-2 font-mono text-[0.75rem] tracking-wider text-[#ff9a9a] backdrop-blur">
              <Activity className="size-3.5" aria-hidden /> 700+ FACILITIES
            </span>
          </div>
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
