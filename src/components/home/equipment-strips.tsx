'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

/**
 * The 'strips' hero picture: the equipment categories the CEO's review asks to feature as a row of photo strips.
 * One strip is open with its name; the rest show their name upright. Hover or focus opens a strip, and the open
 * strip moves on by itself every few seconds (paused on hover or focus). On phones: a row of cards to swipe.
 */
export function EquipmentStrips() {
  const [i, setI] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((n) => (n + 1) % equipment.length), 5000);
    return () => clearTimeout(id);
  }, [i, paused, reduce]);

  return (
    <>
      {/* Tablet and desktop: the strips */}
      <ul
        className="hidden h-[clamp(320px,calc(100svh-440px),440px)] gap-3 md:flex"
        onMouseLeave={() => setPaused(false)}
        onBlur={() => setPaused(false)}
      >
        {equipment.map((e, k) => {
          const open = k === i;
          return (
            <li
              key={e.slug}
              className={cn('relative min-w-0 overflow-hidden rounded-[4px] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none', open ? 'grow-[6]' : 'grow')}
              style={{ flexBasis: 0 }}
              onMouseEnter={() => { setI(k); setPaused(true); }}
            >
              <Link href="/products" onFocus={() => { setI(k); setPaused(true); }} className="group absolute inset-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300" aria-label={`${e.title}: see the equipment we supply`}>
                <Image src={e.image} alt="" fill priority={k < 3} sizes="(min-width: 1280px) 640px, 50vw" className={cn('object-cover transition-transform duration-700', open && 'group-hover:scale-[1.02]')} />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(transparent,rgb(10_16_20/0.85))]" />
                <span className={cn('absolute bottom-6 left-6 right-6 text-white transition-opacity duration-500', open ? 'opacity-100 delay-200' : 'opacity-0')}>
                  <span className="block text-sm font-medium text-white/75">{e.group}</span>
                  <span className="mt-0.5 block truncate text-2xl font-semibold tracking-[-0.01em]">{e.title}</span>
                </span>
                <span aria-hidden className={cn('absolute bottom-6 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap text-base font-semibold text-white transition-opacity duration-300 [writing-mode:vertical-rl]', open ? 'opacity-0' : 'opacity-100')}>
                  {e.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Phones: cards to swipe */}
      <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:hidden">
        {equipment.map((e, k) => (
          <li key={e.slug} className="w-[78%] shrink-0 snap-start">
            <Link href="/products" className="relative block h-72 overflow-hidden rounded-[4px]">
              <Image src={e.image} alt="" fill priority={k === 0} sizes="80vw" className="object-cover" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(transparent,rgb(10_16_20/0.85))]" />
              <span className="absolute bottom-5 left-5 right-5 text-white">
                <span className="block text-sm font-medium text-white/75">{e.group}</span>
                <span className="mt-0.5 block text-xl font-semibold">{e.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
