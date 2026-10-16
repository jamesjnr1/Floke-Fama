import Image from 'next/image';
import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { equipment } from '@/data/equipment';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/** MRI large, CT tall, the other six in two rows of three. */
const span = ['lg:col-span-2 lg:row-span-2', 'lg:row-span-2', '', '', '', '', '', ''];

/** Circular "Saving lives · since 2008 · Ghana" seal with the Flokefama mark in the middle, turning slowly. */
function Seal({ className }: { className?: string }) {
  return (
    <div className={cn('relative size-[132px] rounded-full bg-[#0b3d2a] text-white shadow-[0_20px_40px_-15px_rgb(0_0_0/0.6)]', className)}>
      <svg viewBox="0 0 132 132" className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs><path id="hero-seal" d="M66,66 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
        <text className="fill-current text-[10.5px] font-semibold uppercase tracking-[0.32em]">
          <textPath href="#hero-seal" textLength="292" lengthAdjust="spacing">Saving lives · since 2008 · Ghana · </textPath>
        </text>
      </svg>
      <LogoMark className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2" />
      <span className="sr-only">Saving lives since 2008</span>
    </div>
  );
}

/**
 * The 'collage' hero: a calm green gradient with a faint ring-and-heartbeat design behind the text, and the eight
 * equipment types the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators,
 * ultrasound) as floating photo tiles on the right. The photos share one colour grade (slightly softer, cooler,
 * with a green tint in the shadows) so the mixed sources read as one set.
 */
export async function CollageHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_55%,#043822_100%)] pt-[72px] text-white lg:h-[100svh] lg:min-h-[720px]">
      {/* Faint design: soft light, concentric rings and a heartbeat line, barely visible */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_15%_15%,rgb(127_209_165/0.14),transparent_70%)]" />
      <svg aria-hidden className="absolute -bottom-40 left-[22%] -z-10 size-[620px] text-white/[0.05]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.6">
        {[30, 45, 60, 75, 90].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
      </svg>
      <svg aria-hidden className="absolute inset-x-0 bottom-[18%] -z-10 h-20 w-1/2 text-white/[0.06]" viewBox="0 0 700 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0,50 L180,50 L200,50 L210,20 L220,80 L230,50 L330,50 L340,10 L350,90 L360,50 L700,50" />
      </svg>

      <div className="grid h-full lg:grid-cols-2">
        <div className="flex items-center px-5 py-14 md:px-10 lg:px-16 lg:py-0">
          <Reveal className="max-w-[540px]">
            <h1 className="text-[clamp(2.5rem,1.4rem+3.6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
              {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
            </h1>
            <p className="no-justify mt-7 text-[1.1875rem] leading-relaxed text-white/90">
              From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right">
                <Link href="/support">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="grid min-h-0 grid-cols-2 gap-3 px-5 pb-10 sm:grid-cols-3 md:px-10 lg:grid-rows-4 lg:p-6 lg:pl-2">
          {equipment.map((e, k) => (
            <Link
              key={e.slug}
              href="/services#equipment"
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
              <span aria-hidden className="absolute inset-0 bg-[#0a4a2c] opacity-[0.16] mix-blend-color" />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(200deg,rgb(255_244_225/0.10),transparent_45%)] mix-blend-soft-light" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(transparent,rgb(4_30_18/0.78))]" />
              <span className={cn('absolute bottom-3 left-3 font-semibold text-white', k === 0 ? 'text-xl' : 'text-sm')}>{e.title}</span>
              {e.credit && <span className="absolute right-1.5 top-1.5 bg-black/40 px-1 text-[0.5625rem] text-white/85">{e.credit.author}, {e.credit.license}</span>}
            </Link>
          ))}
        </div>
      </div>

      <Seal className="absolute left-1/2 top-[110px] z-20 hidden -translate-x-1/2 lg:block" />
    </section>
  );
}
