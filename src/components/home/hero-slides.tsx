'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

/** How long each slide shows before the next, in seconds. */
const SECONDS = 7;

/**
 * The hero as slides: the first is the company (passed in as `intro`), then one slide for each piece of large
 * equipment the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators,
 * ultrasound), each as its photo filling the hero with a small caption. The tabs at the foot fill while a slide shows and move on when full;
 * hovering or focusing the hero holds the slide, and with reduced motion nothing moves on by itself. Swipe on touch
 * screens, or use the arrows or the tabs.
 */
export function HeroSlides({ intro }: { intro: React.ReactNode }) {
  const slides = [{ key: 'intro', label: 'Flokefama' }, ...equipment.map((e) => ({ key: e.slug, label: e.title.replace(/ (machines|systems|scanners)$/, '') }))];
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

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

      {/* Tabs: one per slide, the current one filling; arrows on the right */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] items-end gap-4 px-5 pb-6 md:px-10 lg:pb-8">
        <ol className="grid flex-1 grid-cols-9 gap-1.5 md:gap-3">
          {slides.map((s, i) => (
            <li key={s.key}>
              <button type="button" onClick={() => go(i)} aria-label={`Show slide ${i + 1}: ${s.label}`} aria-current={i === index || undefined} className="group block w-full py-2 text-left">
                <span className="relative block h-[3px] overflow-hidden bg-white/20">
                  {i < index && <span className="absolute inset-0 bg-white/60" />}
                  {i === index && (
                    <span
                      key={index}
                      onAnimationEnd={() => go(index + 1)}
                      style={{ animationDuration: `${SECONDS}s`, animationPlayState: held ? 'paused' : 'running' }}
                      className="absolute inset-0 origin-left animate-[slide-progress_linear_forwards] bg-white motion-reduce:animate-none motion-reduce:scale-x-100"
                    />
                  )}
                </span>
                <span className={cn('mt-2 hidden truncate text-xs font-medium transition-colors lg:block', i === index ? 'text-white' : 'text-white/50 group-hover:text-white/80')}>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flex shrink-0 gap-2 pb-1 lg:pb-6">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="grid size-10 place-items-center border border-white/25 text-white transition-colors hover:bg-white hover:text-[#06482a]">
            <Icon name="fi-rr-arrow-small-left" className="text-xl" />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="grid size-10 place-items-center border border-white/25 text-white transition-colors hover:bg-white hover:text-[#06482a]">
            <Icon name="fi-rr-arrow-small-right" className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * One piece of equipment: its photo fills the whole hero, under the menu bar too, darkened towards the foot where a
 * small caption sits above the tabs.
 */
function EquipmentSlide({ e, n, total, priority }: { e: (typeof equipment)[number]; n: number; total: number; priority: boolean }) {
  return (
    <figure className="flex w-full self-stretch">
      <div aria-hidden className="absolute inset-x-0 bottom-0 -top-[72px] -z-10">
        <Image src={e.image} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.45)_0%,transparent_22%,transparent_50%,rgb(0_0_0/0.72)_100%)]" />
      </div>
      <figcaption className="mx-auto mt-auto flex w-full max-w-[1280px] items-end justify-between gap-4 px-5 pb-4 pt-40 md:px-10">
        <span>
          <span className="block text-sm font-medium text-white/75">
            {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')} · {e.group}
          </span>
          <span className="mt-1 block text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_14px_rgb(0_0_0/0.35)]">{e.title}</span>
        </span>
        {e.credit && (
          <span className="shrink-0 text-xs text-white/60">
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
