import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: the head office and its FLOKE sign behind a calm green tint, deeper behind the text. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a laboratory microscope in blue light, filling the right side and fading into the background (from tablet up, so on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-white">
      {/*
        Background: the head office photo behind a calm green tint (less green than before: a neutral photo over a
        muted green-navy), deeper behind the text. Nothing else over it.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_78%_18%,#1e5143_0%,#143b31_52%,#0c2722_100%)]">
        <Image src="/images/head-office.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%] opacity-40 grayscale-[35%]" />
        <div className="absolute inset-0 bg-[#0f3a2f] mix-blend-color opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(10_36_30/0.85)_0%,rgb(10_36_30/0.55)_45%,rgb(10_36_30/0.15)_80%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0c2722] to-transparent" />
        {/* Microscope in blue light: fills the right side and fades straight into the background (towards the text, the nav and the band) */}
        <div className="absolute inset-y-0 right-0 hidden w-[62%] sm:block [mask-composite:intersect] [mask-image:linear-gradient(to_left,#000_45%,transparent_100%),linear-gradient(to_top,transparent_0%,#000_22%),linear-gradient(to_bottom,transparent_0px,#000_150px)] [-webkit-mask-composite:source-in]">
          <Image src="/images/hero-microscope.webp" alt="" fill priority sizes="62vw" className="object-cover object-[22%_50%]" />
        </div>
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
