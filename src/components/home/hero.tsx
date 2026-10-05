import Link from 'next/link';
import { HeroLogos } from '@/components/home/hero-logos';
import { MachineSlideshow } from '@/components/home/machine-slideshow';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/**
 * Hero (the FLOKE_BOLT layout in the Flokefama colours): a deep Mirage → Deep Sea field with a faint ECG trace;
 * the company line and its two actions on the left, a slideshow of Flokefama machines on the right, and the
 * Partners & Clientele band across the bottom.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(135deg,#10191e_0%,#16232a_40%,#0b3b40_72%,#10191e_100%)] text-white">
      {/* Soft glows as gradients (no CSS blur filters, which are costly while scrolling) */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_85%_40%,rgb(0_138_87/0.16),transparent_70%),radial-gradient(30%_40%_at_30%_70%,rgb(13_155_168/0.1),transparent_70%)]" />

      {/* ECG trace */}
      <svg aria-hidden className="absolute inset-x-0 top-[38%] -z-10 h-32 w-full opacity-[0.12]" viewBox="0 0 1400 100" preserveAspectRatio="none">
        <path
                    d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L310,50 L320,10 L330,90 L340,50 L600,50 L620,50 L630,30 L640,70 L650,50 L900,50 L920,50 L930,15 L940,85 L950,50 L1200,50 L1220,50 L1230,25 L1240,75 L1250,50 L1400,50"
          stroke="#7fd1a5"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-12 lg:pb-8">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Reveal>
            <h1 className="text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
              Ghana’s No.1 <span className="block text-brand-300">
                Healthcare Company<span className="text-signal">.</span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="no-justify max-w-2xl text-xl leading-relaxed text-white/85">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
          </Reveal>

          <Reveal delay={0.14} className="flex flex-wrap gap-3">
            <Button asChild size="lg" arrow="up-right">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </Reveal>
        </div>

        {/* A slideshow of the machines Flokefama supplies */}
        <Reveal delay={0.2} className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <MachineSlideshow />
        </Reveal>
      </div>

      <HeroLogos />
    </section>
  );
}
