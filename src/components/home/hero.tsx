import Image from 'next/image';
import Link from 'next/link';
import { HeroCapsule } from '@/components/home/hero-capsule';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Hero Section: deep brand-green canvas over a faint head office photo, 12-column grid.
 * Left (span 7): the company line from flokefama.com, muted subline, and two simple actions
 * (Explore Solutions → shop, Contact Us → contact, as on the current site).
 * Right (span 5): 3D dotted capsule in orbit rings, over a faint wireframe network.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-800 bg-[radial-gradient(120%_90%_at_78%_18%,#1f6b3e_0%,#134228_52%,#0d301d_100%)] text-white">
      {/* Background: head office photo (pre-tinted green, faint), glow, light beam, wireframe network */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-head-office.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_52%] opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(13_48_29/0.85)_0%,rgb(13_48_29/0.55)_45%,rgb(13_48_29/0.15)_80%)]" />
        <div className="absolute -right-40 -top-56 size-[860px] rounded-full bg-[radial-gradient(circle,rgb(82_181_124/0.3),transparent_62%)]" />
        <div className="absolute -bottom-72 -left-40 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(10_38_22/0.8),transparent_70%)]" />
        <div className="absolute -top-20 right-[12%] h-[140%] w-40 rotate-[28deg] bg-gradient-to-b from-brand-300/25 via-brand-400/5 to-transparent blur-2xl" />
        <NetworkCanvas className="absolute inset-0 opacity-95 [mask-image:linear-gradient(90deg,transparent_0%,transparent_38%,#000_70%)]" />
      </div>

      <div className="mx-auto grid lg:min-h-[100svh] max-w-[1280px] grid-cols-1 items-center gap-8 px-5 pb-12 pt-28 md:gap-12 md:px-10 md:pb-20 md:pt-36 lg:grid-cols-12 lg:gap-16 lg:pb-[120px] lg:pt-[168px]">
        {/* Column Left (span 7): vertical, gap 24px */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,16px+4.2vw,84px)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
              Ghana’s No.1 <span className="block text-brand-300">Healthcare Company.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>
          <Reveal delay={0.22} className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="outline" size="lg" className="border-transparent text-brand-800 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] hover:border-transparent">
              <Link href="/products">Explore Solutions <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </Reveal>
        </div>

        {/* Column Right (span 5): the 3D dotted capsule */}
        <Reveal delay={0.2} y={40} className="relative lg:col-span-5">
          <HeroCapsule />
        </Reveal>
      </div>
    </section>
  );
}
