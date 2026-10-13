import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { CatalogueBook } from '@/components/home/catalogue-book';
import { EquipmentStrips } from '@/components/home/equipment-strips';
import { HeroBackdrop } from '@/components/home/hero-backdrop';
import { MachineSlideshow } from '@/components/home/machine-slideshow';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { heroBackground, heroStyle, type HeroBackground } from '@/lib/hero-style';
import { getProducts } from '@/lib/data';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Hero with the Partners & Clientele band across the bottom. Its background is set by heroBackground (the dark teal
 * by default). In the 'catalogue' style (default) the text sits on the left and an open product catalogue on the
 * right. In the 'strips' style the company line sits on the left with the text and
 * actions on its right, and the equipment runs underneath as photo strips. In the 'card' and 'carousel' styles the
 * text is on the left and a slideshow of equipment on the right (see heroStyle).
 */
export async function Hero({ bg = heroBackground }: { bg?: HeroBackground } = {}) {
  const [{ hero }, products] = await Promise.all([getSite(), getProducts()]);
  const light = bg === 'light';
  return (
    <section className={cn('relative isolate flex min-h-[100svh] flex-col overflow-hidden', light ? 'text-ink' : 'text-white')}>
      <HeroBackdrop bg={bg} />

      {heroStyle === 'catalogue' && (
        <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-12 px-5 pb-12 pt-28 md:px-10 md:pt-32 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col gap-7 lg:col-span-5">
            <Reveal>
              <h1 className={cn('text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]', light ? 'text-ink' : 'text-white')}>
                {hero.title} <span className={cn('block', light ? 'text-brand-700' : 'text-brand-300')}>
                  {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className={cn('no-justify text-xl leading-relaxed', light ? 'text-ink-2' : 'text-white/85')}>{hero.lead}</p>
            </Reveal>
            <Reveal delay={0.14} className="grid max-w-[480px] gap-3 sm:grid-cols-2">
              <Button asChild size="lg" arrow="up-right" className="min-w-0 justify-between">
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right" className="min-w-0 justify-between">
                <Link href="/support">Contact Us</Link>
              </Button>
            </Reveal>
          </div>

          {/* An open product catalogue, its page turning through the equipment we supply */}
          <Reveal delay={0.2} className="min-w-0 lg:col-span-7">
            <CatalogueBook products={products.length} />
          </Reveal>
        </div>
      )}

      {heroStyle === 'strips' && (
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center gap-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:gap-12">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h1 className={cn('text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]', light ? 'text-ink' : 'text-white')}>
                {hero.title} <span className={cn('block', light ? 'text-brand-700' : 'text-brand-300')}>
                  {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-6 lg:col-span-5">
              <p className={cn('no-justify text-xl leading-relaxed', light ? 'text-ink-2' : 'text-white/85')}>{hero.lead}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg" arrow="up-right" className="min-w-0 justify-between">
                  <Link href="/products">Explore Solutions</Link>
                </Button>
                <Button asChild size="lg" variant="red" arrow="right" className="min-w-0 justify-between">
                  <Link href="/support">Contact Us</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* The equipment Flokefama supplies, as photo strips */}
          <Reveal delay={0.16}>
            <EquipmentStrips />
          </Reveal>
        </div>
      )}

      {(heroStyle === 'card' || heroStyle === 'carousel') && (
        <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-12 lg:pb-8">
          <div className="flex min-w-0 flex-col gap-7 lg:col-span-7">
            <Reveal>
              <h1 className={cn('text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]', light ? 'text-ink' : 'text-white')}>
                {hero.title} <span className={cn('block', light ? 'text-brand-700' : 'text-brand-300')}>
                  {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className={cn('no-justify max-w-2xl text-xl leading-relaxed', light ? 'text-ink-2' : 'text-white/85')}>{hero.lead}</p>
            </Reveal>

            <Reveal delay={0.14} className="flex flex-wrap gap-3">
              <Button asChild size="lg" arrow="up-right">
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right">
                <Link href="/support">Contact Us</Link>
              </Button>
            </Reveal>
          </div>

          {/* A slideshow of the machines Flokefama supplies */}
          <Reveal delay={0.2} className="mx-auto w-full min-w-0 max-w-md lg:col-span-5 lg:max-w-none">
            <MachineSlideshow />
          </Reveal>
        </div>
      )}

      <HeroLogos />
    </section>
  );
}
