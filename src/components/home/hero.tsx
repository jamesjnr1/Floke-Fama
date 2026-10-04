import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: Wild Sand with the network mesh on the right (no photo). Left: the company line from flokefama.com and its two actions (Explore Solutions → shop,
 * Contact Us → contact). The mesh shows from tablet up (on phones
 * the partner band still shows on the first screen).
 * Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-sand text-ink">
      {/* Background: Wild Sand with the drifting network mesh on the right (no photo), fading out behind the text */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-sand">
        <NetworkCanvas className="absolute inset-0 hidden sm:block [mask-image:linear-gradient(90deg,transparent_0%,transparent_38%,#000_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
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
