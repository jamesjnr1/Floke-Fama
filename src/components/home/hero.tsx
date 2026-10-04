import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: a pale cool blue-white, with the microscope photo dissolving into it on the right. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a laboratory microscope in blue light, filling the right side and fading into the background (from tablet up, so on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#f1f7fb] text-ink">
      {/*
        Background: a pale, cool blue-white taken from the microscope photo's own highlights. The photo is mostly
        light, so it dissolves into this colour with no murky band: solid behind the text, easing out across the
        middle, and softening into white above the partner band.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#f1f7fb]">
        <div className="absolute inset-y-0 right-0 hidden w-[70%] sm:block">
          <Image src="/images/hero-microscope.webp" alt="" fill priority sizes="70vw" className="object-cover object-[22%_50%]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#f1f7fb_0%,#f1f7fb_32%,rgb(241_247_251/0.9)_42%,rgb(241_247_251/0.5)_56%,rgb(241_247_251/0.12)_74%,rgb(241_247_251/0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(241_247_251/0.55)_0%,rgb(241_247_251/0)_20%,rgb(241_247_251/0)_74%,#ffffff_100%)]" />
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
            <p className="max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
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
