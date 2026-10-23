import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { CatalogueBook } from '@/components/home/catalogue-book';
import { CollageHero } from '@/components/home/collage-hero';
import { SpotlightHero } from '@/components/home/spotlight-hero';
import { SimpleHero } from '@/components/home/simple-hero';
import { ModernHero } from '@/components/home/modern-hero';
import { MovingHero } from '@/components/home/moving-hero';
import { CataloguePages } from '@/components/home/catalogue-pages';
import { EquipmentStrips } from '@/components/home/equipment-strips';
import { HeroBackdrop } from '@/components/home/hero-backdrop';
import { MachineSlideshow } from '@/components/home/machine-slideshow';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { heroBackground, heroStyle, type HeroBackground } from '@/lib/hero-style';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Hero with the Partners & Clientele band across the bottom. Its background is set by heroBackground (the dark teal
 * by default). In the 'pages' style (default) the text sits on the left and a stack of catalogue pages on the
 * right; 'catalogue' shows an open product catalogue there instead. In the 'strips' style the company line sits on the left with the text and
 * actions on its right, and the equipment runs underneath as photo strips. In the 'card' and 'carousel' styles the
 * text is on the left and a slideshow of equipment on the right (see heroStyle).
 */
export async function Hero({ bg = heroBackground }: { bg?: HeroBackground } = {}) {
  if (heroStyle === 'modern') {
    // Taller than one screen with its showcase, so it isn't squeezed to share the first screen with the logos
    return (
      <>
        <ModernHero />
        <HeroLogos />
      </>
    );
  }
  if (heroStyle === 'collage' || heroStyle === 'feature' || heroStyle === 'spotlight' || heroStyle === 'simple' || heroStyle === 'moving') {
    return (
      // Hero and the Clients & Partners band share the first screen, so the logos show without scrolling
      <div className="flex flex-col lg:h-[100svh] lg:min-h-[860px]">
        {heroStyle === 'moving' ? <MovingHero /> : heroStyle === 'simple' ? <SimpleHero /> : heroStyle === 'spotlight' ? <SpotlightHero /> : <CollageHero feature={heroStyle === 'feature'} />}
        <HeroLogos />
      </div>
    );
  }
  const { hero } = await getSite();
  const light = bg === 'light';
  return (
    <section className={cn('relative isolate flex min-h-[100svh] flex-col overflow-hidden', light ? 'text-ink' : 'text-white')}>
      <HeroBackdrop bg={bg} />

      {(heroStyle === 'pages' || heroStyle === 'catalogue') && (
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

          {/* The equipment we supply: a stack of catalogue pages, or an open catalogue, turning through it */}
          <Reveal delay={0.2} className="min-w-0 lg:col-span-7">
            {heroStyle === 'pages' ? <CataloguePages /> : <CatalogueBook />}
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
