'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Machines from the Flokefama shop, with the product photos published there. */
const machines = [
  { slug: 'auto-heamatology-analyzer-bc5150', name: 'BC-5150 Haematology Analyser', brand: 'Mindray' },
  { slug: 'semi-automated-chemistry-analysermindray', name: 'BA-88A Semi-Auto Chemistry Analyser', brand: 'Mindray' },
  { slug: 'dp-10-ultrasound', name: 'DP-10 Ultrasound', brand: 'Mindray' },
  { slug: 'patient-monitor-comen', name: 'Patient Monitor', brand: 'Comen' },
  { slug: 'microscope-olympus-cx23', name: 'CX23 Microscope', brand: 'Olympus' },
  { slug: 'urine-analyzer-ua-66', name: 'UA-66 Urine Analyser', brand: 'Mindray' },
  { slug: 'defribillator', name: 'Defibrillator', brand: 'Comen' },
  { slug: 'cpap-machine', name: 'CPAP Machine', brand: 'Yuwell' },
];

/** Hero slideshow: one machine at a time, cross-fading every few seconds; pauses on hover or focus. */
export function MachineSlideshow() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const m = machines[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((n) => (n + 1) % machines.length), 4200);
    return () => clearTimeout(id);
  }, [i, paused, reduce]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div aria-hidden className="absolute -left-2 -top-2 size-10 border-l-2 border-t-2 border-brand-300" />
      <div aria-hidden className="absolute -bottom-2 -right-2 size-10 border-b-2 border-r-2 border-signal" />

      <Link href={`/products/${m.slug}`} className="group block overflow-hidden bg-white" aria-label={`${m.brand} ${m.name}: view product`}>
        <div className="relative h-[clamp(220px,calc(100svh-540px),420px)] bg-[radial-gradient(90%_70%_at_50%_40%,#fff_0%,#eef3f4_70%,#e4eef0_100%)]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={m.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src={`/images/products/${m.slug}.webp`} alt={`${m.brand} ${m.name}`} fill priority={i === 0} sizes="(min-width: 1024px) 480px, 90vw" className="object-contain p-8 mix-blend-multiply" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between gap-4 bg-[#121d23] px-5 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-300">{m.brand}</p>
            <p className="truncate text-lg font-bold text-white">{m.name}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-white/80 underline-offset-4 group-hover:text-white group-hover:underline">View</span>
        </div>
      </Link>

      <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Choose a machine">
        {machines.map((x, n) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={`${x.brand} ${x.name}`}
            onClick={() => setI(n)}
            className={cn('h-1.5 transition-all duration-500', n === i ? 'w-8 bg-brand-300' : 'w-3 bg-white/30 hover:bg-white/60')}
          />
        ))}
      </div>
    </div>
  );
}
