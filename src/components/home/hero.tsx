import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { EquipmentStrips } from '@/components/home/equipment-strips';
import { MachineSlideshow } from '@/components/home/machine-slideshow';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { heroStyle } from '@/lib/hero-style';
import { navStyle } from '@/lib/nav-style';
import { getSite } from '@/lib/site';

/**
 * Hero in the Flokefama colours: a deep Mirage → Deep Sea field with a faint ECG trace and the Partners & Clientele
 * band across the bottom. In the 'strips' style (default) the company line sits on the left with the text and
 * actions on its right, and the equipment runs underneath as photo strips. In the 'card' and 'carousel' styles the
 * text is on the left and a slideshow of equipment on the right (see heroStyle).
 */
export async function Hero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(135deg,#10191e_0%,#16232a_40%,#0b3b40_72%,#10191e_100%)] text-white">
      {/* Soft glows as gradients (no CSS blur filters, which are costly while scrolling) */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_85%_40%,rgb(0_138_87/0.16),transparent_70%),radial-gradient(30%_40%_at_30%_70%,rgb(13_155_168/0.1),transparent_70%)]" />

      {/* Under the full-width menu bar: start in the bar's own colour, so there is no dark edge where they meet */}
      {navStyle === 'bar' && <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-56 bg-[linear-gradient(180deg,#16232a_0,#16232a_72px,rgb(22_35_42/0)_100%)]" />}

      {/* ECG trace */}
      <svg aria-hidden className="absolute inset-x-0 top-[38%] -z-10 h-32 w-full opacity-[0.12]" viewBox="0 0 1400 100" preserveAspectRatio="none">
        <path
                    d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L310,50 L320,10 L330,90 L340,50 L600,50 L620,50 L630,30 L640,70 L650,50 L900,50 L920,50 L930,15 L940,85 L950,50 L1200,50 L1220,50 L1230,25 L1240,75 L1250,50 L1400,50"
          stroke="#7fd1a5"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {heroStyle === 'strips' ? (
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center gap-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:gap-12">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <Reveal className="lg:col-span-7">
              <h1 className="text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
                {hero.title} <span className="block text-brand-300">
                  {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-6 lg:col-span-5">
              <p className="no-justify text-xl leading-relaxed text-white/85">{hero.lead}</p>
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
      ) : (
        <div className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 items-center gap-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-12 lg:pb-8">
          <div className="flex min-w-0 flex-col gap-7 lg:col-span-7">
            <Reveal>
              <h1 className="text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
                {hero.title} <span className="block text-brand-300">
                  {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="no-justify max-w-2xl text-xl leading-relaxed text-white/85">{hero.lead}</p>
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
