import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: the head office and its FLOKE sign in natural colour, shaded in deep brand green behind the
 * text. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a Mindray TE7 ultrasound system, cut out and floating on the hero, the
 * kind of equipment Flokefama supplies as Mindray's official distributor (from tablet up, so on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/*
          Desktop: the photo is sized from the screen (width max(100vw, 160svh), the photo's own 1.6 ratio) and
          lifted so the FLOKE COMPANY LTD. sign (rows 190 to 310 of 988) always sits just under the nav, in full.
          The text then starts below the sign. Phones: a plain cover crop, so the partner band stays on screen.
        */}
        <div className="absolute inset-0 lg:inset-auto lg:left-1/2 lg:top-[calc(104px_-_max(100vw,160svh)*0.1203)] lg:aspect-[1580/988] lg:w-[max(100vw,160svh)] lg:-translate-x-1/2 lg:[mask-image:linear-gradient(#000_78%,transparent)]">
          <Image src="/images/hero-brand.webp" alt="" fill priority sizes="max(100vw, 160svh)" className="object-cover object-[8%_0%] md:object-[50%_0%]" />
        </div>
        {/* The building melts into the dark green background (the photo's sky is already toned to it): edges fall away into shade */}
        <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_20%,transparent_55%,rgb(6_32_30/0.7)_100%)]" />
        {/* Deep green-navy shade behind the text and the lower photo; on desktop the sign's band stays clear */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_32_30/0.9)_0%,rgb(6_32_30/0.72)_42%,rgb(6_32_30/0.28)_75%,rgb(6_32_30/0.18)_100%)] lg:[mask-image:linear-gradient(180deg,transparent_calc(96px_+_max(100vw,160svh)*0.076),#000_calc(176px_+_max(100vw,160svh)*0.076))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_32_30/0.35)_0%,transparent_25%,transparent_45%,rgb(6_32_30/0.85)_80%,rgb(6_32_30/0.95)_100%)] lg:bg-[linear-gradient(180deg,rgb(6_32_30/0.6)_0px,rgb(6_32_30/0.25)_88px,transparent_104px,rgb(6_32_30/0.12)_30%,rgb(6_32_30/0.3)_45%,rgb(6_32_30/0.85)_78%,rgb(6_32_30/0.97)_100%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-8 px-5 pb-10 pt-28 md:gap-12 md:px-10 md:pt-32 lg:grid-cols-12 lg:items-start lg:gap-16 lg:pb-8 lg:pt-[calc(126px_+_max(100vw,160svh)*0.076)]">
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
        <Reveal delay={0.2} y={40} className="relative hidden sm:block lg:col-span-5">
          <figure className="relative mx-auto w-full max-w-[250px] sm:max-w-[320px] lg:max-w-[min(360px,calc(48svh_-_128px))]">
            {/* Soft brand light behind the device, so it sits in the scene */}
            <div aria-hidden className="absolute -inset-x-16 -inset-y-8 rounded-full bg-[radial-gradient(closest-side,rgb(52_161_116/0.32),rgb(47_128_183/0.12)_55%,transparent)] blur-2xl" />
            <Image src="/images/hero-ultrasound.webp" alt="Mindray TE7 ultrasound system" width={718} height={954} priority sizes="(min-width: 1024px) 360px, 320px" className="relative h-auto w-full drop-shadow-[0_30px_45px_rgb(0_0_0/0.45)]" />
            <figcaption className="relative mt-1 flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-medium text-white/80">
              <span className="size-1.5 rounded-full bg-signal" aria-hidden />
              Official Mindray distributor in Ghana
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
