'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

/** How long each slide shows before the next, in seconds. */
const SECONDS = 7;

/** Products from the shop, two to a slide, with the shop's own photos (on white). */
type Product = { slug: string; title: string; tag: string };
const pairs: [Product, Product][] = [
  [
    { slug: 'autoclave-machine-35l', title: 'Autoclave Machine 35L', tag: 'Sterilisation' },
    { slug: 'biological-microscope', title: 'Biological Microscope', tag: 'Laboratory' },
  ],
  [
    { slug: 'auto-heamatology-analyzer-bc5150', title: 'BC-5150 Haematology Analyser', tag: 'Mindray' },
    { slug: 'patient-monitor-comen', title: 'Patient Monitor', tag: 'Critical care' },
  ],
  [
    { slug: 'cpap-machine', title: 'CPAP Machine', tag: 'Respiratory' },
    { slug: 'dp-10-ultrasound', title: 'DP-10 Ultrasound', tag: 'Imaging' },
  ],
  [
    { slug: 'omron-m7', title: 'Omron M7 Blood Pressure Monitor', tag: 'Monitoring' },
    { slug: 'emergency-trolley', title: 'Emergency Trolley', tag: 'Emergency' },
  ],
];

type Slide = { key: string; label: string } & ({ kind: 'intro' } | { kind: 'equipment'; e: (typeof equipment)[number] } | { kind: 'products'; pair: [Product, Product] });

/** The company first; then the large equipment two at a time, each pair followed by two products from the shop. */
const slides: Slide[] = [{ key: 'intro', label: 'Flokefama', kind: 'intro' }];
equipment.forEach((e, i) => {
  slides.push({ key: e.slug, label: e.title, kind: 'equipment', e });
  const pair = pairs[(i - 1) / 2];
  if (i % 2 === 1 && pair) slides.push({ key: `products-${pair[0].slug}`, label: `${pair[0].title} and ${pair[1].title}`, kind: 'products', pair });
});

/**
 * The hero as slides: the first is the company (passed in as `intro`), then one slide for each piece of large
 * equipment the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators,
 * ultrasound), each as its photo filling the hero with its name in a small caption; after every two of them, two
 * products from the shop, shown large side by side on white. The slides move on by
 * themselves; hovering or focusing the hero holds the slide, and with reduced motion nothing moves on by itself.
 * Swipe on touch screens, or use the chevrons at the sides (shown from the second slide on).
 */
export function HeroSlides({ intro }: { intro: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

  // Dark on the white product slides, white over the photos
  const arrow = cn(
    'absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center transition-opacity hover:opacity-75',
    slides[index].kind === 'products' ? 'text-ink' : 'text-white drop-shadow-[0_1px_6px_rgb(0_0_0/0.5)]',
  );

  // Move on after a while, unless the hero is held (hovered or focused) or the visitor asked for less motion
  useEffect(() => {
    if (held || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => go(index + 1), SECONDS * 1000);
    return () => clearTimeout(t);
  }, [index, held, go]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Flokefama and the equipment we supply"
      className="relative flex w-full flex-1 flex-col lg:min-h-0"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      {/* All slides share one cell, so the hero keeps the height of the tallest; only the current one shows */}
      <div className="grid flex-1 lg:min-h-0">
        {slides.map((s, i) => {
          const on = i === index;
          return (
            <div
              key={s.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${s.label}`}
              aria-hidden={!on || undefined}
              inert={!on}
              className={cn(
                'col-start-1 row-start-1 flex items-center transition-opacity duration-700 ease-out-expo motion-reduce:transition-none',
                on ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {s.kind === 'intro' ? intro : s.kind === 'equipment' ? <EquipmentSlide e={s.e} n={i + 1} total={slides.length} priority={i === 1} /> : <ProductsSlide pair={s.pair} />}
            </div>
          );
        })}
      </div>

      {/* Previous and next: bold chevrons at the left and right edges, on every slide but the first */}
      {index > 0 && (
        <>
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className={cn(arrow, 'left-1 md:left-4')}>
            <Chevron className="rotate-90" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className={cn(arrow, 'right-1 md:right-4')}>
            <Chevron className="-rotate-90" />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * One piece of equipment: its photo fills the whole hero, under the menu bar too, darkened towards the foot where a
 * small caption sits centred.
 */
function EquipmentSlide({ e, n, total, priority }: { e: (typeof equipment)[number]; n: number; total: number; priority: boolean }) {
  return (
    <figure className="flex w-full self-stretch">
      <div aria-hidden className="absolute inset-x-0 bottom-0 -top-[72px] -z-10">
        <Image src={e.image} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.45)_0%,transparent_22%,transparent_50%,rgb(0_0_0/0.72)_100%)]" />
      </div>
      <figcaption className="mx-auto mt-auto w-full max-w-[1280px] px-5 pb-6 pt-40 text-center md:px-10 lg:pb-8">
        <span>
          <span className="block text-sm font-medium text-white/75">
            {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')} · {e.group}
          </span>
          <span className="mt-1 block text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_14px_rgb(0_0_0/0.35)]">{e.title}</span>
        </span>
        {e.credit && (
          <span className="mt-1 block text-xs text-white/60">
            Photo:{' '}
            <a href={e.credit.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
              {e.credit.author}
            </a>
            , {e.credit.license}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Two products from the shop, large and side by side on white (the white fills the hero below the menu bar), with a
 * thin line between them and a small caption under each.
 */
function ProductsSlide({ pair }: { pair: [Product, Product] }) {
  return (
    <div className="flex w-full self-stretch">
      <div aria-hidden className="absolute inset-0 -z-10 bg-white" />
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 divide-x divide-line px-5 py-8 md:px-10 lg:py-10">
        {pair.map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="group flex flex-col px-3 md:px-10">
            <span className="relative block h-[300px] sm:h-[340px] lg:h-auto lg:flex-1">
              <Image src={`/images/products/${p.slug}.webp`} alt={p.title} fill sizes="(min-width: 1024px) 560px, 50vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
            </span>
            <span className="mt-4 block text-center text-sm">
              <span className="text-ink-3">{p.tag} · </span>
              <span className="font-semibold text-ink group-hover:text-brand-700">{p.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** The bold chevron of the page headers' scroll cue, pointing down; rotated for previous and next. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('size-9', className)} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}
