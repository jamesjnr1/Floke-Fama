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
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#10191e_0%,#16232a_40%,#0b3b40_72%,#10191e_100%)] text-white">
      <div aria-hidden className="absolute -right-32 top-1/4 -z-10 size-[600px] rounded-full bg-brand-500/15 blur-[120px]" />
      <div aria-hidden className="absolute bottom-1/3 left-1/4 -z-10 size-[420px] rounded-full bg-[#0d9ba8]/10 blur-[100px]" />
      <div aria-hidden className="absolute right-1/3 top-1/2 -z-10 size-[300px] rounded-full bg-signal/10 blur-[90px]" />

      {/* ECG trace */}
      <svg aria-hidden className="absolute inset-x-0 top-[38%] -z-10 h-32 w-full opacity-[0.12]" viewBox="0 0 1400 100" preserveAspectRatio="none">
        <path
          className="ecg-path"
          d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L310,50 L320,10 L330,90 L340,50 L600,50 L620,50 L630,30 L640,70 L650,50 L900,50 L920,50 L930,15 L940,85 L950,50 L1200,50 L1220,50 L1230,25 L1240,75 L1250,50 L1400,50"
          stroke="#7fd1a5"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-14 pt-32 md:px-10 md:pt-36 lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Reveal>
            <h1 className="text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">
              Ghana’s No.1 <span className="block text-brand-300">
                Healthcare Company<span className="text-signal">.</span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="max-w-2xl text-xl leading-relaxed text-white/85">Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.</p>
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
