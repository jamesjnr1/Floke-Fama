import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { getSite } from '@/lib/site';

/** The moving row on the hero: products from the shop, as product photos on white, shown whole. */
const heroItems = [
  { slug: 'autoclave-machine-35l', title: 'Autoclave Machine 35L' },
  { slug: 'biological-microscope', title: 'Biological Microscope' },
  { slug: 'cpap-machine', title: 'CPAP Machine' },
  { slug: 'dp-10-ultrasound', title: 'DP-10 Ultrasound' },
  { slug: 'omron-m7', title: 'Omron M7 Blood Pressure Monitor' },
  { slug: 'oxygen-cylinder-40l', title: 'Oxygen Cylinder 40L' },
  { slug: 'emergency-trolley', title: 'Emergency Trolley' },
].map((p) => ({ key: p.slug, title: p.title, image: `/images/products/${p.slug}.webp`, href: `/products/${p.slug}`, cutout: true }));

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
 * The 'simple' hero: everything centred on the green gradient (headline, lead and the two actions), with the
 * equipment row underneath (see heroItems) moving slowly across.
 */
export async function SimpleHero({ design = heroDesign }: { design?: HeroDesign }) {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />
      <HeroDesignLayer design={design} />
      {/* A faint ECG line pulsing across, as on the modern hero, between the actions and the product row; its beat sits
          in the open space on the left so the buttons don't cover it */}
      {/* The pulse animation sets the line's own opacity, so the wrapper keeps it faint */}
      <div aria-hidden className="absolute inset-x-0 top-[50%] -z-10 h-28 opacity-60">
        <svg className="h-full w-full animate-[ecg-pulse_4s_ease-in-out_infinite] text-emerald-400 opacity-20 motion-reduce:animate-none" viewBox="0 0 1200 150" preserveAspectRatio="none" fill="none">
          <path d="M0 75H120L135 40L150 110L170 20L190 130L205 60L220 75H1200" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-10 px-5 py-12 md:px-10 lg:min-h-0 lg:gap-8 lg:px-8 lg:pb-6 lg:pt-14 [@media(min-height:1000px)]:lg:gap-12 [@media(min-height:1000px)]:lg:pt-24">
        <Reveal className="flex flex-col items-center text-center">
          {/* The company name first, as its own logotype, then the claim */}
          <h1 className="flex max-w-[1100px] flex-col items-center text-white">
            {/* The company name in heavy, tightly set capitals (Inter Black) */}
            <span className="font-wordmark text-[clamp(3.4rem,6.6vw,6.25rem)] font-black uppercase leading-[0.82] tracking-[-0.08em]">
              Floke Fama<span className="sr-only">,</span>
            </span>
            <span className="mt-5 text-[clamp(1.75rem,1.1rem+1.9vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
              {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="no-justify mt-4 max-w-[760px] text-[1.0625rem] lg:max-w-[880px] leading-relaxed text-white/85">
            Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </Reveal>

        {/* The equipment photos move slowly from right to left in one row (paused on hover; still if motion is reduced) */}
        <div className="w-full overflow-hidden lg:min-h-[215px] lg:flex-1">
          <ul className="flex h-[230px] w-max animate-marquee [animation-duration:60s] hover:[animation-play-state:paused] motion-reduce:animate-none lg:h-full">
            {[false, true].flatMap((hidden) =>
              heroItems.map((e) => (
                <li key={`${e.key}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="h-full shrink-0 pr-3">
                  <Link href={e.href} tabIndex={hidden ? -1 : undefined} className="group flex h-full w-[clamp(260px,25vw,440px)] flex-col">
                    <span className={e.cutout ? 'relative block min-h-0 flex-1 overflow-hidden bg-white' : 'relative block min-h-0 flex-1 overflow-hidden'}>
                      <Image
                        src={e.image}
                        alt={hidden ? '' : e.title}
                        fill
                        sizes="440px"
                        className={e.cutout ? 'object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]' : 'object-cover [filter:saturate(0.85)] transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:[filter:saturate(1)]'}
                      />
                    </span>
                    <span className="mt-2 block truncate text-[0.8125rem] font-medium text-white/80 transition-colors group-hover:text-white">{e.title}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
