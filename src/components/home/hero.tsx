import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: Light Blue, with the microscope photo dissolving into it on the right. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a laboratory microscope in blue light, filling the right side and fading into the background (from tablet up, so on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-sky text-ink">
      {/*
        Background: Light Blue from the palette. The photo is mostly light and cool, so it dissolves into it cleanly: solid behind the text, easing out across the
        middle, and softening into white above the partner band.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-sky">
        <div className="absolute inset-y-0 right-0 hidden w-[58%] sm:block">
          <Image src="/images/hero-microscope.webp" alt="" fill priority sizes="58vw" className="object-cover object-[30%_50%]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-sky)_0%,var(--color-sky)_44%,color-mix(in_srgb,var(--color-sky)_85%,transparent)_52%,color-mix(in_srgb,var(--color-sky)_40%,transparent)_63%,color-mix(in_srgb,var(--color-sky)_10%,transparent)_78%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-sky)_55%,transparent)_0%,transparent_20%,transparent_74%,#ffffff_100%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-8 px-5 pb-10 pt-28 md:gap-12 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-16 lg:pb-10">
        <div className="flex flex-col gap-6 lg:col-span-7 lg:gap-5">
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,min(16px+4.2vw,8svh),80px)] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
              Ghana’s No.1 <span className="block text-brand-600">
                Healthcare Company<span className="text-signal">.</span>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-ink md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>
          <Reveal delay={0.22} className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild variant="red" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </Reveal>
        </div>
      </div>

      <HeroLogos />
    </section>
  );
}
