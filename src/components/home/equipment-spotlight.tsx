'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { equipment } from '@/data/equipment';
import { cn } from '@/lib/utils';

const grade = 'object-cover [filter:saturate(0.82)_contrast(1.06)_brightness(0.97)]';
const every = 5000;

/**
 * The 'spotlight' hero stage: the text (children) on the left, and one equipment photo filling the right side edge to
 * edge, melting into the green on its left. Between them a numbered index of the eight types; the active one shows its
 * description and a line that fills until the next comes up (paused on hover or focus).
 */
export function EquipmentSpotlight({ children }: { children: ReactNode }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const e = equipment[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((n) => (n + 1) % equipment.length), every);
    return () => clearTimeout(id);
  }, [i, paused, reduce]);

  const hold = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) };

  return (
    <>
      {/* The photo: full height on large screens, blended into the background on the left */}
      <Link href="/products" aria-label={`${e.title}: see the equipment we supply`} className="relative -z-10 order-last block aspect-[4/3] overflow-hidden lg:absolute lg:inset-y-0 lg:left-[40%] lg:right-0 lg:aspect-auto lg:[mask-image:linear-gradient(90deg,transparent_0%,rgb(0_0_0/0.35)_18%,black_50%)]" {...hold}>
        <AnimatePresence initial={false}>
          <motion.div key={e.slug} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}>
            <Image src={e.image} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 56vw, 100vw" className={grade} />
          </motion.div>
        </AnimatePresence>
        <span aria-hidden className="absolute inset-0 bg-[#0a4a2c] opacity-[0.18] mix-blend-color" />
        <span aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(4_44_26/0.7)_15%,rgb(4_44_26/0.35)_45%,transparent_70%)] lg:block" />
        <span aria-hidden className="absolute inset-x-0 top-0 hidden h-40 bg-[linear-gradient(180deg,rgb(6_72_42/0.75),transparent)] lg:block" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(transparent,rgb(4_40_24/0.6))]" />
        <span className="absolute bottom-5 left-5 right-5 lg:hidden">
          <span className="block text-sm font-medium text-[#7fd1a5]">{e.group}</span>
          <span className="mt-0.5 block text-2xl font-bold tracking-[-0.02em] text-white">{e.title}</span>
        </span>
        {e.credit && <span className="absolute bottom-2 right-2 bg-black/40 px-1.5 text-[0.8125rem] text-white/85">Photo: {e.credit.author}, {e.credit.license}</span>}
      </Link>

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 items-center gap-10 px-5 py-14 md:px-10 lg:grid-cols-[minmax(0,1.2fr)_290px_minmax(0,0.55fr)] lg:gap-10 lg:px-16 lg:py-10">
        {children}

        {/* The index of the eight types */}
        <ol className="hidden lg:grid lg:grid-cols-1 lg:gap-y-1" aria-label="Equipment we supply" {...hold}>
          {equipment.map((x, n) => {
            const on = n === i;
            return (
              <li key={x.slug}>
                <button type="button" aria-current={on || undefined} onClick={() => setI(n)} className="group block w-full py-1.5 text-left">
                  <span className="flex items-baseline gap-3">
                    <span className={cn('text-xs tabular-nums transition-colors', on ? 'text-[#7fd1a5]' : 'text-white/45')}>{String(n + 1).padStart(2, '0')}</span>
                    <span className={cn('font-semibold tracking-[-0.01em] transition-colors', on ? 'text-lg text-white' : 'text-[0.9375rem] text-white/60 group-hover:text-white')}>{x.title}</span>
                  </span>
                  {on && (
                    <span className="mt-1.5 hidden pl-7 lg:block">
                      <span className="block text-[0.8125rem] leading-snug text-white/75">{x.text}</span>
                      <span className="mt-2.5 block h-px bg-white/20">
                        <motion.span key={`${x.slug}-${paused}`} className="block h-px origin-left bg-[#7fd1a5]" initial={{ scaleX: 0 }} animate={{ scaleX: paused || reduce ? 0 : 1 }} transition={{ duration: paused || reduce ? 0 : every / 1000, ease: 'linear' }} />
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        <div aria-hidden className="hidden lg:block" />
      </div>

      {/* Every photo loads up front, so none appears late */}
      <div aria-hidden className="pointer-events-none invisible absolute size-px overflow-hidden">
        {equipment.map((x) => <div key={x.slug} className="relative size-px"><Image src={x.image} alt="" fill loading="eager" sizes="(min-width: 1024px) 56vw, 100vw" /></div>)}
      </div>
    </>
  );
}
