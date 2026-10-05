import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/** Each pillar has its own accent (number, ticks and link), so the four read as a set but stay distinct. */
const accents = {
  green: { num: 'bg-brand-600', tick: 'text-brand-600', bar: 'bg-brand-600' },
  teal: { num: 'bg-[#087d88]', tick: 'text-[#087d88]', bar: 'bg-[#087d88]' },
  red: { num: 'bg-signal', tick: 'text-signal-700', bar: 'bg-signal' },
  amber: { num: 'bg-[#a87a00]', tick: 'text-[#a87a00]', bar: 'bg-[#e8ab00]' },
} as const;

const pillars = [
  {
    title: 'In-Vitro Diagnostics',
    body: 'Analysers with matched reagents and controls, from the official distributor of Mindray and Biozek Holland.',
    points: ['Biochemistry & haematology analysers', 'Point-of-care testing', 'Microbiology equipment'],
    href: '/products?category=in-vitro-diagnostics',
    image: '/images/products/auto-heamatology-analyzer-bc5150.webp',
    alt: 'Mindray BC-5150 haematology analyser',
    product: true,
    accent: 'green',
  },
  {
    title: 'Patient Monitoring & Critical Care',
    body: 'Monitors, defibrillators, CTG and respiratory support for wards and theatres.',
    points: ['Patient monitors', 'Defibrillators & ECG', 'CPAP & oxygen therapy'],
    href: '/products?category=critical-care',
    image: '/images/products/patient-monitor-comen.webp',
    alt: 'Comen patient monitor',
    product: true,
    accent: 'teal',
  },
  {
    title: 'Biomedical Engineering',
    body: 'Our engineers install, calibrate and maintain every system we supply.',
    points: ['Installation & commissioning', 'Calibration', 'Repairs & spare parts'],
    href: '/services',
    image: '/images/pillars/biomedical-engineer.webp',
    alt: 'A biomedical technician working at the control panel of an X-ray machine',
    product: false,
    accent: 'red',
  },
  {
    title: 'Reagents & Consumables',
    body: 'A continuous, reliable supply of reagents, cuvettes, lamps and disposables.',
    points: ['Chemistry reagents', 'Spare lamps & cuvettes', 'Six branches nationwide'],
    href: '/products?category=consumables',
    image: '/images/products/ba-88a-bulb.webp',
    alt: 'Replacement lamp for the Mindray BA-88A analyser',
    product: true,
    accent: 'amber',
  },
] as const;

/**
 * Home: "Four pillars of medical infrastructure". Four equal cards on the deep navy band: a photo, the pillar's
 * number, what it covers in one line and three points; the whole card opens that part of the site.
 */
export function Capabilities() {
  return (
    <section aria-labelledby="capabilities-title" className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#10191e_0%,#16232a_55%,#0b3b40_100%)] py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <h2 id="capabilities-title" className="display text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] text-white">
            Four pillars of <br className="hidden sm:block" />
            <span className="text-brand-300">medical infrastructure.</span>
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-white/80">
            From diagnostics to delivery: one partner for the equipment, the engineers and the supplies that keep it running.
          </p>
        </Reveal>

        <ol className="swipe-row mt-10 gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {pillars.map((p, i) => {
            const a = accents[p.accent];
            return (
              <li key={p.title}>
                <Reveal delay={i * 0.06} className="h-full">
                  <Link
                    href={p.href}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-paper shadow-[0_30px_60px_-40px_rgb(0_0_0/0.7)] transition duration-500 ease-out-expo hover:-translate-y-1.5"
                  >
                    <div className={cn('relative aspect-[4/3.6] overflow-hidden', p.product ? 'bg-white' : 'bg-midnight')}>
                      <Image
                        src={p.image}
                        alt={p.alt}
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 84vw"
                        className={cn('transition-transform duration-700 ease-out-expo group-hover:scale-105', p.product ? 'object-contain p-3' : 'object-cover')}
                      />
                      <span className={cn('absolute left-4 top-4 grid size-11 place-items-center rounded-xl text-base font-bold text-white', a.num)}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span aria-hidden className={cn('h-1 w-full', a.bar)} />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] text-ink">{p.title}</h3>
                      <p className="mb-5 mt-2 text-base leading-relaxed text-ink-3">{p.body}</p>
                      <ul className="mt-auto space-y-2.5 border-t border-line pt-5">
                        {p.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink-2">
                            <Check className={cn('mt-0.5 size-4 shrink-0', a.tick)} strokeWidth={2.5} aria-hidden />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
