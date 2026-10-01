import Link from 'next/link';
import { HeroGlobe } from '@/components/home/hero-globe';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Hero Section: dark canvas, 12-column grid.
 * Left (span 7): the company line from flokefama.com, muted subline, and two simple actions
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

      <div className="mx-auto grid lg:min-h-[100svh] max-w-[1280px] grid-cols-1 items-center gap-8 px-5 pb-12 pt-28 md:gap-12 md:px-10 md:pb-20 md:pt-36 lg:grid-cols-12 lg:gap-16 lg:pb-[120px] lg:pt-[168px]">
        {/* Column Left (span 7): vertical, gap 24px */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Reveal delay={0.06}>
            <h1 className="display text-[clamp(42px,16px+4.2vw,84px)] uppercase leading-[0.95] text-white">
              Ghana’s No.1 <span className="text-gradient">Healthcare Company.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-white/60 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>
          <Reveal delay={0.22} className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="glow" size="lg">
              <Link href="/products">Explore Solutions <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
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
