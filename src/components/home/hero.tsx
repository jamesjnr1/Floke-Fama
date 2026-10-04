import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: a calm deep green-navy background. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a laboratory microscope in blue light, filling the right side and fading into the background (from tablet up, so on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-white">
      {/*
        Background: a calm deep green-navy, with the microscope photo on the right fading out over a long, even
        distance (left, top and bottom), so there is no visible edge. A light tint of the same colour ties the
        photo's blue into the background.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,#0a2420_0%,#0d2b2c_45%,#0e2a36_100%)]">
        <div className="absolute inset-y-0 right-0 hidden w-[68%] sm:block [mask-composite:intersect] [mask-image:linear-gradient(to_left,#000_40%,rgb(0_0_0/0.7)_65%,transparent_100%),linear-gradient(to_top,transparent_0%,#000_30%),linear-gradient(to_bottom,transparent_0%,#000_28%)] [-webkit-mask-composite:source-in]">
          <Image src="/images/hero-microscope.webp" alt="" fill priority sizes="68vw" className="object-cover object-[22%_50%] brightness-[1.12]" />
          <div className="absolute inset-0 bg-[#0d2b2c] opacity-10 mix-blend-multiply" />
        </div>
        <div className="absolute -left-40 top-1/3 size-[620px] rounded-full bg-[radial-gradient(circle,rgb(0_122_77/0.18),transparent_65%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-8 px-5 pb-10 pt-28 md:gap-12 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-16 lg:pb-10">
        <div className="flex flex-col gap-6 lg:col-span-7 lg:gap-5">
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,min(16px+4.2vw,8svh),80px)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
              Ghana’s No.1 <span className="block text-brand-300">
                Healthcare Company<span className="text-signal">.</span>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
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
