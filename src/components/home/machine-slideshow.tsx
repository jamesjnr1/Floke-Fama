'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Machines from the Flokefama shop, with the product photos published there. */
const machines = [
  { slug: 'auto-heamatology-analyzer-bc5150', name: 'BC-5150 Haematology Analyser', brand: 'Mindray' },
  { slug: 'omron-m7', name: 'M7 Blood Pressure Monitor', brand: 'Omron' },
  { slug: 'dp-10-ultrasound', name: 'DP-10 Ultrasound', brand: 'Mindray' },
  { slug: 'patient-monitor-comen', name: 'Patient Monitor', brand: 'Comen' },
  { slug: 'microscope-olympus-cx23', name: 'CX23 Microscope', brand: 'Olympus' },
  { slug: 'oxygen-cylinder-40l', name: 'Oxygen Cylinder 40L', brand: 'Floke' },
  { slug: 'emergency-trolley', name: 'Emergency Trolley', brand: 'Floke' },
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
      {/* The card: thin low-contrast border, soft shadow, a small lift on hover */}
      <Link
        href={`/products/${m.slug}`}
        className="group block overflow-hidden rounded-xl border border-white/10 bg-[#121d23] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgb(0_0_0/0.7)] motion-reduce:hover:translate-y-0"
        aria-label={`${m.brand} ${m.name}: view product`}
      >
        {/* Image area: one fixed height for every machine, soft off-white, room around the product */}
        <div className="relative h-[clamp(220px,calc(100svh-560px),400px)] bg-[#F5F7F6]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={m.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image src={`/images/products/${m.slug}.webp`} alt={`${m.brand} ${m.name}`} fill priority={i === 0} sizes="(min-width: 1024px) 480px, 90vw" className="object-contain p-10 mix-blend-multiply md:p-12" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="px-6 py-5">
          <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-brand-300">{m.brand}</p>
          <div className="mt-1.5 flex items-baseline justify-between gap-4">
            <p className="truncate text-lg font-semibold leading-snug text-white">{m.name}</p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-white/75 transition group-hover:text-white">
              View <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>
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
