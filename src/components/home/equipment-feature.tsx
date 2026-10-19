'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

/** The shared colour grade on every photo, so the mixed sources read as one set. */
const grade = 'object-cover [filter:saturate(0.82)_contrast(1.06)_brightness(0.97)]';

/**
 * One equipment photo shown large, with all eight as thumbnails underneath. Every few seconds the next one comes up
 * (paused on hover or focus); a thumbnail brings its photo up straight away.
 */
export function EquipmentFeature({ light = false, tint = true, fade = 'rgb(4 30 18 / 0.82)' }: { light?: boolean; tint?: boolean; fade?: string } = {}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const e = equipment[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((n) => (n + 1) % equipment.length), 4500);
    return () => clearTimeout(id);
  }, [i, paused, reduce]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Link href="/products" className="group relative block min-h-[280px] flex-1 overflow-hidden shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]" aria-label={`${e.title}: see the equipment we supply`}>
        <AnimatePresence initial={false}>
          <motion.div key={e.slug} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <Image src={e.image} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 46vw, 100vw" className={grade} />
          </motion.div>
        </AnimatePresence>
        {tint && <span aria-hidden className="absolute inset-0 bg-[#0a4a2c] opacity-[0.16] mix-blend-color" />}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundImage: `linear-gradient(transparent, ${fade})` }} />
        <span className="absolute bottom-6 left-6 right-6">
          <span className={cn('block text-sm font-medium', tint ? 'text-[#7fd1a5]' : 'text-white/80')}>{e.group}</span>
          <span className="mt-1 block text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">{e.title}</span>
          <span className="mt-1.5 hidden max-w-lg text-white/80 sm:block">{e.text}</span>
        </span>
        {e.credit && <span className="absolute right-2 top-2 bg-black/40 px-1.5 text-[0.8125rem] text-white/85">Photo: {e.credit.author}, {e.credit.license}</span>}
      </Link>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="tablist" aria-label="Choose equipment">
        {equipment.map((x, n) => (
          <button key={x.slug} type="button" role="tab" aria-selected={n === i} aria-label={x.title} onClick={() => setI(n)} className="group text-left">
            <span className={cn('relative block aspect-[4/3] overflow-hidden ring-2 transition', n === i ? (light ? 'ring-[#0f7a4b]' : 'ring-[#7fd1a5]') : 'ring-transparent opacity-70 hover:opacity-100')}>
              <Image src={x.image} alt="" fill sizes="120px" className={grade} />
            </span>
            <span className={cn('mt-1.5 block truncate text-[0.8125rem]', light ? (n === i ? 'font-semibold text-[#0b2a1e]' : 'text-[#5d6a64]') : n === i ? 'text-white' : 'text-white/60')}>{x.title.replace(/ (machines|systems)$/, '')}</span>
          </button>
        ))}
      </div>
      {/* Every photo loads up front, so none appears late */}
      <div aria-hidden className="pointer-events-none invisible absolute size-px overflow-hidden">
        {equipment.map((x) => <div key={x.slug} className="relative size-px"><Image src={x.image} alt="" fill loading="eager" sizes="(min-width: 1024px) 46vw, 100vw" /></div>)}
      </div>
    </div>
  );
}
