import Image from 'next/image';
import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { HeroScene } from '@/components/home/hero-scene';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero: clean warm off-white with a faint glimpse of the head office's FLOKE sign. Left: the company
 * line from flokefama.com and its two actions (Explore Solutions → shop, Contact Us → contact).
 * Right: the 3D laboratory scene. Bottom band: Our Partners & Clientele, visible without scrolling.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-canvas text-ink">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/hero-brand.webp" alt="" fill priority sizes="100vw" className="object-cover object-[8%_0%] opacity-[0.14] grayscale md:object-[50%_0%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(247_248_245/0.2)_0%,rgb(247_248_245/0.85)_45%,#f7f8f5_80%)]" />
        <div className="absolute -right-40 top-10 size-[720px] rounded-full bg-[radial-gradient(circle,rgb(47_128_183/0.12),transparent_65%)]" />
        <div className="absolute -left-40 bottom-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(0_122_77/0.08),transparent_65%)]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-6 px-5 pb-8 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-10 lg:pb-10">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <Reveal>
            <p className="label">Total healthcare solutions · Since 2008</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-[clamp(42px,16px+4.2vw,78px)] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
              Ghana’s No.1 <span className="block text-brand-600">Healthcare Company.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>
          <Reveal delay={0.22} className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </Reveal>
        </div>
        <Reveal delay={0.2} y={40} className="relative hidden sm:block lg:col-span-6">
          <HeroScene />
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
