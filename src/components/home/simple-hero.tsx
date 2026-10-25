import Link from 'next/link';
import { HeroSlides } from '@/components/home/hero-slides';
import { LogoMark } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { getSite } from '@/lib/site';

/**
 * An optional faint drawing on the hero's green. 'none' (default): the plain gradient. 'contours': gentle flowing
 * lines, like a topographic map. 'arcs': wide concentric arcs rising from below the headline. 'light': soft
 * diagonal bands of light, no lines.
 * Switch with NEXT_PUBLIC_HERO_DESIGN in Vercel (then redeploy).
 */
const designs = ['none', 'contours', 'arcs', 'light'] as const;
export type HeroDesign = (typeof designs)[number];
const envDesign = process.env.NEXT_PUBLIC_HERO_DESIGN as HeroDesign | undefined;
const heroDesign: HeroDesign = envDesign && designs.includes(envDesign) ? envDesign : 'none';

function HeroDesignLayer({ design }: { design: HeroDesign }) {
  if (design === 'none') return null;
  if (design === 'arcs') {
    return (
      <svg aria-hidden className="absolute left-1/2 top-[18%] -z-10 h-[1400px] w-[1400px] -translate-x-1/2" viewBox="0 0 1400 1400" fill="none">
        {[180, 280, 380, 480, 580, 680].map((r, i) => (
          <circle key={r} cx="700" cy="700" r={r} stroke="white" strokeOpacity={0.13 - i * 0.016} strokeWidth="1.2" />
        ))}
      </svg>
    );
  }
  if (design === 'light') {
    return (
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_0%,transparent_30%,rgb(255_255_255/0.08)_38%,transparent_46%,transparent_58%,rgb(255_255_255/0.06)_66%,transparent_74%)]" />
    );
  }
  // contours: smooth lines drifting across, brighter at the edges and fading towards the centre so the text stays clear
  const lines = Array.from({ length: 9 }, (_, i) => {
    const y = 120 + i * 70;
    return `M-50,${y} C250,${y - 90} 450,${y + 110} 720,${y + 10} S1150,${y - 120} 1490,${y + 30}`;
  });
  return (
    <svg
      aria-hidden
      className="absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(70%_60%_at_50%_35%,transparent_25%,#000_80%)]"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="white" strokeOpacity="0.13" strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/**
 * The 'simple' hero: slides on the green gradient. The first has everything centred (the name, the claim, the lead
 * and the two actions); the rest show the large equipment one at a time (see HeroSlides).
 */
export async function SimpleHero({ design = heroDesign }: { design?: HeroDesign }) {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />
      <HeroDesignLayer design={design} />
      {/* Slides: the company first, then the large equipment, one at a time */}
      <HeroSlides
        intro={
          <div className="flex w-full flex-col items-center px-5 py-12 text-center md:px-10 lg:py-6">
            {/* A faint ECG line pulsing across, as on the modern hero; its beat sits in the open space on the left so the
                buttons don't cover it; it shows with this slide only */}
            {/* The pulse animation sets the line's own opacity, so the wrapper keeps it faint */}
            <div aria-hidden className="absolute inset-x-0 top-[50%] -z-10 h-28 opacity-60">
              <svg className="h-full w-full animate-[ecg-pulse_4s_ease-in-out_infinite] text-emerald-400 opacity-20 motion-reduce:animate-none" viewBox="0 0 1200 150" preserveAspectRatio="none" fill="none">
                <path d="M0 75H120L135 40L150 110L170 20L190 130L205 60L220 75H1200" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            {/* The company name first, as its own logotype, then the claim */}
            <h1 className="flex max-w-[1100px] flex-col items-center text-white">
              {/* The company name in heavy, tightly set capitals (Inter Black) */}
              {/* The leaf mark beside the name, as tall as the letters */}
              <span className="flex items-center gap-[0.14em] whitespace-nowrap font-wordmark text-[clamp(2.75rem,8vw,7.6rem)] font-black uppercase leading-[0.82] tracking-[-0.08em]">
                <LogoMark className="size-[0.86em]" />
                <span>
                  Floke Fama<span className="sr-only">,</span>
                </span>
              </span>
              <span className="mt-6 text-[clamp(1.75rem,1.1rem+1.9vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
                {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
              </span>
            </h1>
            <p className="no-justify mt-6 max-w-[820px] text-[clamp(1.125rem,0.95rem+0.6vw,1.4375rem)] leading-relaxed text-white/90 lg:max-w-[960px]">
              Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right">
                <Link href="/support">Contact Us</Link>
              </Button>
            </div>
          </div>
        }
      />
    </section>
  );
}
