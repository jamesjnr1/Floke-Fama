import Link from 'next/link';
import { HeroGlobe } from '@/components/home/hero-globe';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';

/**
 * Hero Section: dark canvas, 12-column grid.
 * Left (span 7): the company line from flokefama.com, muted subline, bracketed actions
 * (Explore Solutions → shop, Contact Us → contact, as on the current site).
 * Right (span 5): 3D network globe with the published figures, over a faint wireframe network.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      {/* Background: glow, light beam, wireframe network */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-56 size-[860px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.28),transparent_62%)]" />
        <div className="absolute -bottom-72 -left-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(23_38_30/0.9),transparent_70%)]" />
        <div className="absolute -top-20 right-[12%] h-[140%] w-40 rotate-[28deg] bg-gradient-to-b from-brand-300/25 via-brand-400/5 to-transparent blur-2xl" />
        <NetworkCanvas className="absolute inset-0 opacity-40 [mask-image:linear-gradient(90deg,transparent_0%,rgb(0_0_0/0.35)_38%,#000_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-midnight to-transparent" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-[1280px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-36 md:px-16 lg:grid-cols-12 lg:gap-8 lg:pb-[120px] lg:pt-[168px]">
        {/* Column Left (span 7): vertical, gap 24px */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Reveal>
            <p className="label flex items-center gap-3 !text-brand-300">
              <span className="status-dot" aria-hidden /> Ghana Club 100 · No.1 in Healthcare · Est. 2008
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display text-[clamp(2.6rem,1.1rem+4.6vw,5rem)] uppercase leading-[0.95] text-white">
              Ghana’s No.1 <span className="text-gradient">Healthcare Company.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-white/60 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>
          <Reveal delay={0.22} className="pt-2">
            {/* Action Button: bracketed outline control holding the two actions from the current site */}
            <div className="flex w-full flex-col rounded-xl border sm:inline-flex sm:w-auto sm:flex-row sm:items-center border-brand-500 bg-brand-500/10 text-sm font-medium shadow-[0_0_40px_-12px_rgb(46_154_91/0.8)] backdrop-blur md:text-[15px]">
              <span aria-hidden className="hidden pl-4 font-mono text-brand-300 sm:inline">[</span>
              <Link href="/products" className="rounded-lg px-4 py-3.5 text-white transition hover:bg-brand-700/20 sm:px-3">
                Explore Solutions
              </Link>
              <span aria-hidden className="hidden font-mono text-brand-300/60 sm:inline">|</span>
              <Link href="/contact" className="group rounded-lg border-t border-brand-500/30 px-4 py-3.5 text-white transition hover:bg-brand-700/20 sm:border-0 sm:px-3">
                Contact Us <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
              <span aria-hidden className="hidden pr-4 font-mono text-brand-300 sm:inline">]</span>
            </div>
          </Reveal>
        </div>

        {/* Column Right (span 5): the 3D network globe */}
        <Reveal delay={0.2} y={40} className="relative lg:col-span-5">
          <HeroGlobe />
        </Reveal>
      </div>
    </section>
  );
}
