'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { equipment } from '@/data/equipment';

const arrow = (dir: 'left' | 'right') => (
  <svg aria-hidden viewBox="0 0 16 16" className="size-4">
    <path d={dir === 'right' ? 'M3 8h9.5M8.5 4l4 4-4 4' : 'M13 8H3.5M7.5 4l-4 4 4 4'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The 'catalogue' hero picture: an open Flokefama product catalogue. The cover (with the brochure's own line,
 * "Purveyor of excellence in healthcare") on the left; on the right page, the equipment the CEO's review asks the
 * home showcase to feature (MRI, CT, mammography, X-ray, dialysis, incubators, ventilators, ultrasound), one per
 * page with its photo, category, name and description. The page turns every few seconds (paused on hover or focus);
 * the arrows turn it by hand. On phones only the page is shown.
 */
export function CatalogueBook({ products }: { products: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = equipment.length;
  const e = equipment[i];
  const go = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => go(1), 4800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart the timer on every page
  }, [i, paused, reduce]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] [perspective:1800px]">
      {/* Cover */}
      <div className="relative hidden aspect-[3/4] w-1/2 origin-right flex-col bg-white p-7 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] [transform:rotateY(10deg)] md:flex">
        <div className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <LogoWordmark className="h-[14px] text-[#00703A]" />
        </div>
        <p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-700">Purveyor of excellence in healthcare</p>
        <p className="mt-1.5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Product
          <br />
          Catalogue
        </p>
        <div className="relative mt-4 min-h-0 flex-1">
          <Image src="/images/hero/auto-heamatology-analyzer-bc5150.webp" alt="" fill priority sizes="300px" className="object-contain" />
        </div>
        <div className="-mx-7 -mb-7 mt-4 flex items-center justify-between bg-[#00703A] px-7 py-3 text-xs font-semibold text-white">
          <span>{products} products</span>
          <span>flokefama.com</span>
        </div>
      </div>

      {/* The page: one piece of equipment at a time */}
      <div
        className="relative flex aspect-[3/4] w-full origin-left flex-col bg-[#f7f9f8] p-5 text-ink shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] md:w-1/2 md:p-6 md:[transform:rotateY(-10deg)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-3">Medical equipment we supply</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={e.slug}
            className="mt-3 flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/services#equipment" className="group flex min-h-0 flex-1 flex-col" aria-label={`${e.title}: see the equipment we supply`}>
              <div className="relative min-h-0 flex-1 overflow-hidden bg-mist">
                <Image src={e.image} alt="" fill sizes="(min-width: 768px) 320px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                {e.credit && <span className="absolute bottom-0 right-0 bg-black/45 px-1.5 py-0.5 text-[0.5625rem] text-white">Photo: {e.credit.author}, {e.credit.license}</span>}
              </div>
              <span className="mt-3 w-fit rounded-[4px] bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-700">{e.group}</span>
              <span className="mt-1.5 text-lg font-bold leading-tight tracking-[-0.01em]">{e.title}</span>
              <span className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-ink-3">{e.text}</span>
            </Link>
          </motion.div>
        </AnimatePresence>
        <div className="mt-3 flex items-center justify-end text-[0.75rem] text-ink-3">
          <span className="flex items-center gap-1">
            <button type="button" onClick={() => go(-1)} aria-label="Previous equipment" className="grid size-7 place-items-center rounded-[4px] text-ink-2 transition hover:bg-ink/[0.06]">{arrow('left')}</button>
            <span className="tabular-nums" aria-live="polite">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" onClick={() => go(1)} aria-label="Next equipment" className="grid size-7 place-items-center rounded-[4px] text-ink-2 transition hover:bg-ink/[0.06]">{arrow('right')}</button>
          </span>
        </div>
      </div>

      {/* Loads every photo up front, so a page never turns to an empty frame */}
      <div aria-hidden className="pointer-events-none invisible absolute size-px overflow-hidden">
        {equipment.map((x) => (
          <div key={x.slug} className="relative size-px">
            <Image src={x.image} alt="" fill loading="eager" sizes="(min-width: 768px) 320px, 90vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
