import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { HeroScene } from '@/components/home/hero-scene';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: the head office and its FLOKE sign in natural colour, shaded in deep brand green behind the
 * text. Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). Right: the 3D pharmacy cross in its distribution rings, over the network
 * mesh (from tablet up, so on phones the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/hero-brand.webp" alt="" fill priority sizes="100vw" className="object-cover object-[8%_0%] md:object-[50%_0%]" />
        {/* Deep green-navy shade behind the text and the lower photo; the sign and facade keep their colour */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_32_30/0.9)_0%,rgb(6_32_30/0.72)_42%,rgb(6_32_30/0.28)_75%,rgb(6_32_30/0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_32_30/0.35)_0%,transparent_25%,transparent_45%,rgb(6_32_30/0.85)_80%,rgb(6_32_30/0.95)_100%)]" />
        <NetworkCanvas className="absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent_0%,transparent_40%,#000_72%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-8 px-5 pb-10 pt-28 md:gap-12 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-16 lg:pb-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,16px+4.2vw,80px)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
              Ghana’s No.1 <span className="block text-brand-300">Healthcare Company.</span>
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
          <HeroScene />
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
