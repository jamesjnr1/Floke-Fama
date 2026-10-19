import Image from 'next/image';
import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { EquipmentFeature } from '@/components/home/equipment-feature';
import { equipment } from '@/data/equipment';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/** MRI large, CT tall, the other six in two rows of three. */
const span = ['lg:col-span-2 lg:row-span-2', 'lg:row-span-2', '', '', '', '', '', ''];

/** Circular "Saving lives · since 2008 · Ghana" seal with the Flokefama mark in the middle, turning slowly. */
export function Seal({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-[112px] rounded-full bg-[#0b3d2a] text-white shadow-[0_20px_40px_-15px_rgb(0_0_0/0.6)]', className)}>
      <svg viewBox="0 0 132 132" className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs><path id="hero-seal" d="M66,66 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
        <text className="fill-current text-[10.5px] font-semibold uppercase tracking-[0.32em]">
          <textPath href="#hero-seal" textLength="292" lengthAdjust="spacing">Saving lives · since 2008 · Ghana · </textPath>
        </text>
      </svg>
      <LogoMark className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2" />
      <span className="sr-only">Saving lives since 2008</span>
    </div>
  );
}

/**
 * The 'collage' hero: a calm green gradient with a faint pattern of small medical crosses and soft light bands behind the text, and the eight
 * equipment types the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators,
 * ultrasound) as floating photo tiles on the right. The photos share one colour grade (slightly softer, cooler,
 * with a green tint in the shadows) so the mixed sources read as one set.
 */
/** Background colour options for the hero gradient (see heroTone). */
export const heroTones = {
  green: 'bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_55%,#043822_100%)]',
  teal: 'bg-[linear-gradient(150deg,#10191e_0%,#16232a_35%,#0b3b40_75%,#0d4a46_100%)]',
  forest: 'bg-[linear-gradient(160deg,#1d3b2c_0%,#13291f_55%,#0c1c15_100%)]',
  emerald: 'bg-[linear-gradient(150deg,#007a4d_0%,#06623f_45%,#075056_100%)]',
  midnight: 'bg-[linear-gradient(160deg,#0f2233_0%,#0b1a28_55%,#08131d_100%)]',
  // Drawn from the photos themselves (clinical whites, light greys, warm beige), so they sit seamlessly on it
  stone: 'bg-[linear-gradient(160deg,#f4f2ec_0%,#ebe8e0_55%,#e0ddd3_100%)]',
  mist: 'bg-[linear-gradient(160deg,#f3f6f6_0%,#e7ecec_55%,#d9e0e0_100%)]',
  graphite: 'bg-[linear-gradient(160deg,#34322e_0%,#26241f_55%,#1b1a17_100%)]',
} as const;
/** Light backgrounds take dark text. */
const lightTones: HeroTone[] = ['stone', 'mist'];
/** Backgrounds drawn from the photos keep the photos' own colours (no green tint). */
const neutralTones: HeroTone[] = ['stone', 'mist', 'graphite'];
/** The dark shade each photo's caption fade uses, taken from its background, so photo and page meet without a seam. */
const fades: Partial<Record<HeroTone, string>> = { stone: 'rgb(52 48 40 / 0.78)', mist: 'rgb(30 42 44 / 0.75)', graphite: 'rgb(27 26 23 / 0.85)', teal: 'rgb(11 30 34 / 0.82)', midnight: 'rgb(8 19 29 / 0.85)' };
export type HeroTone = keyof typeof heroTones;

export async function CollageHero({ feature = false, tone = 'green' }: { feature?: boolean; tone?: HeroTone } = {}) {
  const light = lightTones.includes(tone);
  const tint = !neutralTones.includes(tone);
  const { hero } = await getSite();
  return (
    <section className={cn('relative isolate overflow-hidden pt-[72px]', heroTones[tone], light ? 'text-ink' : 'text-white', 'flex flex-col lg:min-h-0 lg:flex-1')}>
      {/* Faint design: soft light, a fine grid of small medical crosses fading out, and two gentle diagonal light bands */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_15%_15%,rgb(127_209_165/0.14),transparent_70%)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(70%_80%_at_20%_60%,black,transparent_75%)]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M22 17v10M17 22h10' stroke='${light ? '%230b2a1e' : 'white'}' stroke-opacity='${light ? 0.08 : 0.07}' stroke-width='1.4' stroke-linecap='round'/></svg>")`,
        }}
      />
      <div aria-hidden className={cn('absolute -left-[10%] top-0 -z-10 h-full w-[60%] -skew-x-[24deg]', light ? 'bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)]' : 'bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.035),transparent)]')} />
      <div aria-hidden className={cn('absolute left-[18%] top-0 -z-10 h-full w-[18%] -skew-x-[24deg]', light ? 'bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.4),transparent)]' : 'bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.025),transparent)]')} />

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div className="flex items-center px-5 py-14 md:px-10 lg:px-16 lg:py-0">
          <Reveal className="max-w-[540px]">
            <h1 className={cn('text-[clamp(2.5rem,1.4rem+2.8vw,3.875rem)] font-extrabold leading-[1.02] tracking-[-0.04em]', light ? 'text-[#0b2a1e]' : 'text-white')}>
              {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
            </h1>
            <p className={cn('no-justify mt-6 max-w-[480px] text-[1.0625rem] leading-relaxed', light ? 'text-[#3d4b45]' : 'text-white/90')}>
              From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" arrow="up-right" className={light ? 'bg-[#0b3d2a] text-white hover:bg-[#062a1d]' : 'bg-white text-[#00703A] hover:bg-white/90'}>
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right">
                <Link href="/support">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        {feature ? (
          <div className="min-h-0 px-5 pb-10 md:px-10 lg:py-12 lg:pl-4 lg:pr-12"><EquipmentFeature light={light} tint={tint} fade={fades[tone]} /></div>
        ) : (
        <div className="grid min-h-0 grid-cols-2 gap-3 px-5 pb-10 sm:grid-cols-3 md:px-10 lg:grid-rows-4 lg:p-6 lg:pl-2">
          {equipment.map((e, k) => (
            <Link
              key={e.slug}
              href="/products"
              className={cn('group relative aspect-[4/3] overflow-hidden shadow-[0_20px_40px_-20px_rgb(0_0_0/0.7)] lg:aspect-auto', (k === 0 || k === 7) && 'col-span-2', k === 7 && 'sm:col-span-1', span[k])}
            >
              <Image
                src={e.image}
                alt={e.title}
                fill
                priority={k < 2}
                sizes={k === 0 ? '(min-width: 1024px) 34vw, 100vw' : '(min-width: 1024px) 17vw, 50vw'}
                className="object-cover transition-transform duration-700 [filter:saturate(0.82)_contrast(1.06)_brightness(0.97)] group-hover:scale-[1.04]"
              />
              {/* Shared grade: green in the shadows, then a soft fade for the label */}
              {tint && <span aria-hidden className="absolute inset-0 bg-[#0a4a2c] opacity-[0.16] mix-blend-color" />}
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(200deg,rgb(255_244_225/0.10),transparent_45%)] mix-blend-soft-light" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(transparent,rgb(4_30_18/0.78))]" />
              <span className={cn('absolute bottom-3 left-3 font-semibold text-white', k === 0 ? 'text-xl' : 'text-sm')}>{e.title}</span>
              {e.credit && <span className="absolute right-1.5 top-1.5 bg-black/40 px-1 text-[0.8125rem] text-white/85">{e.credit.author}, {e.credit.license}</span>}
            </Link>
          ))}
        </div>
        )}
      </div>

      <Seal className="absolute left-1/2 top-[116px] z-20 hidden -translate-x-1/2 lg:block" />
    </section>
  );
}
