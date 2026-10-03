import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: the head office and its FLOKE sign in natural colour, shaded in deep brand green behind the
 * text. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: a Mindray BeneHeart D3 defibrillator on a soft white stage, the kind
 * of equipment Flokefama supplies as Mindray's official distributor (from tablet up, so on phones
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
        {/* Deep green-navy shade behind the text and the lower photo; on desktop the sign's band stays clear */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_32_30/0.9)_0%,rgb(6_32_30/0.72)_42%,rgb(6_32_30/0.28)_75%,rgb(6_32_30/0.18)_100%)] lg:[mask-image:linear-gradient(180deg,transparent_calc(96px_+_max(100vw,160svh)*0.076),#000_calc(176px_+_max(100vw,160svh)*0.076))]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_32_30/0.35)_0%,transparent_25%,transparent_45%,rgb(6_32_30/0.85)_80%,rgb(6_32_30/0.95)_100%)] lg:bg-[linear-gradient(180deg,rgb(6_32_30/0.82)_0px,rgb(6_32_30/0.45)_80px,transparent_112px,transparent_45%,rgb(6_32_30/0.85)_80%,rgb(6_32_30/0.95)_100%)]" />
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
            <Button asChild variant="glass" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.2} y={40} className="relative hidden sm:block lg:col-span-5">
          <figure className="relative mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[min(480px,52svh)]">
            {/* Soft green light behind the stage, so it sits in the scene rather than on top of it */}
            <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgb(52_161_116/0.28),transparent_65%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_42%,#ffffff_45%,#e8eef0_100%)] p-5 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.65)] ring-1 ring-white/30 md:p-7">
              {/* The photo's white background melts into the stage (multiply) */}
              <Image src="/images/hero-defibrillator.webp" alt="Mindray BeneHeart D3 defibrillator and patient monitor" width={1068} height={893} priority sizes="(min-width: 1024px) 440px, 360px" className="relative h-auto w-full mix-blend-multiply" />
            </div>
            <figcaption className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-brand-800 px-4 py-2 text-[13px] font-medium text-white shadow-[0_12px_30px_-10px_rgb(0_0_0/0.5)] ring-1 ring-white/15">
              <span className="size-2 rounded-full bg-brand-300" aria-hidden />
              Official Mindray distributor in Ghana
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
