'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

/** How long each slide shows before the next, in seconds. */
const SECONDS = 7;

/**
 * The hero as slides: the first is the company (passed in as `intro`), then one slide for each piece of large
 * equipment the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators,
 * ultrasound), each as its photo filling the hero with its name in a small caption. The slides move on by
 * themselves; hovering or focusing the hero holds the slide, and with reduced motion nothing moves on by itself.
 * Swipe on touch screens, or use the arrows.
 */
export function HeroSlides({ intro }: { intro: React.ReactNode }) {
  const slides = [{ key: 'intro', label: 'Flokefama' }, ...equipment.map((e) => ({ key: e.slug, label: e.title }))];
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

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
          const e = equipment[i - 1];
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
              {i === 0 ? intro : <EquipmentSlide e={e} n={i + 1} total={slides.length} priority={i === 1} />}
            </div>
          );
        })}
      </div>

      {/* Previous and next, at the bottom right */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex max-w-[1280px] justify-end gap-2 px-5 pb-6 md:px-10 lg:pb-8">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="pointer-events-auto grid size-10 place-items-center border border-white/30 text-white transition-colors hover:bg-white hover:text-[#06482a]">
            <Icon name="fi-rr-arrow-small-left" className="text-xl" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="pointer-events-auto grid size-10 place-items-center border border-white/30 text-white transition-colors hover:bg-white hover:text-[#06482a]">
            <Icon name="fi-rr-arrow-small-right" className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * One piece of equipment: its photo fills the whole hero, under the menu bar too, darkened towards the foot where a
 * small caption sits beside the arrows.
 */
function EquipmentSlide({ e, n, total, priority }: { e: (typeof equipment)[number]; n: number; total: number; priority: boolean }) {
  return (
    <figure className="flex w-full self-stretch">
      <div aria-hidden className="absolute inset-x-0 bottom-0 -top-[72px] -z-10">
        <Image src={e.image} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.45)_0%,transparent_22%,transparent_50%,rgb(0_0_0/0.72)_100%)]" />
      </div>
      <figcaption className="mx-auto mt-auto w-full max-w-[1280px] px-5 pb-6 pr-32 pt-40 md:px-10 md:pr-36 lg:pb-8">
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
