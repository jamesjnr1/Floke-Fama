'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { equipment } from '@/data/equipment';

/** The loose pages under the top one, each turned a little further. */
const under = [
  { rotate: 10.5, x: 30, y: 12, opacity: 0.55 },
  { rotate: 7, x: 20, y: 8, opacity: 0.7 },
  { rotate: 3.5, x: 10, y: 4, opacity: 0.85 },
];

/**
 * The 'pages' hero picture: a stack of loose Flokefama catalogue pages, slightly fanned. The top page shows the
 * equipment the CEO's review asks the home showcase to feature (MRI, CT, mammography, X-ray, dialysis, incubators,
 * ventilators, ultrasound), one at a time with its photo, category, name and description; every few seconds it slides
 * away to show the next (paused on hover or focus). The page opens the equipment on Products & Services.
 */
export function CataloguePages() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = equipment.length;
  const e = equipment[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), 4500);
    return () => clearTimeout(id);
  }, [i, paused, reduce, n]);

  return (
    <div
      className="relative mx-auto aspect-[11/14] w-full max-w-[440px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {under.map((u) => (
        <div key={u.rotate} aria-hidden className="absolute inset-0 bg-white" style={{ transform: `translate(${u.x}px, ${u.y}px) rotate(${u.rotate}deg)`, opacity: u.opacity }} />
      ))}

      <AnimatePresence initial={false}>
        <motion.div
          key={e.slug}
          className="absolute inset-0"
          initial={{ opacity: 0, rotate: 3.5, x: 10, y: 4 }}
          animate={{ opacity: 1, rotate: 0, x: 0, y: 0 }}
          exit={{ opacity: 0, rotate: -8, x: -70, y: 10 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/products" className="group flex h-full flex-col bg-white p-5 text-ink sm:p-6" aria-label={`${e.title}: see the equipment we supply`}>
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LogoMark className="size-6" />
                <LogoWordmark className="h-[12px] text-[#00703A]" />
              </span>
              <span className="text-sm tabular-nums text-ink-3">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            </span>
            <span className="relative mt-5 min-h-0 flex-1 overflow-hidden bg-mist">
              <Image src={e.image} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 400px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              {e.credit && <span className="absolute bottom-0 right-0 bg-black/45 px-1.5 py-0.5 text-[0.8125rem] text-white">Photo: {e.credit.author}, {e.credit.license}</span>}
            </span>
            <span className="mt-5 w-fit rounded-[4px] bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{e.group}</span>
            <span className="mt-2 text-2xl font-bold tracking-[-0.02em]">{e.title}</span>
            <span className="no-justify mt-1.5 line-clamp-3 text-ink-3">{e.text}</span>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Loads every photo up front, so a page never turns to an empty frame */}
      <div aria-hidden className="pointer-events-none invisible absolute size-px overflow-hidden">
        {equipment.map((x) => (
          <div key={x.slug} className="relative size-px">
            <Image src={x.image} alt="" fill loading="eager" sizes="(min-width: 1024px) 400px, 90vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
