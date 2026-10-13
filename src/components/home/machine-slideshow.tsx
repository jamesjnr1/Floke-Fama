'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { equipment } from '@/data/equipment';
import { heroStyle } from '@/lib/hero-style';
import { cn } from '@/lib/utils';

/**
 * Machines from the Flokefama shop, with the product photos published there. `label` is the line above the name:
 * the brand for Mindray (the one manufacturer brand shown on the site), otherwise what the machine is for.
 */
const machines = [
  { slug: 'auto-heamatology-analyzer-bc5150', name: 'BC-5150 Haematology Analyser', label: 'Mindray' },
  { slug: 'omron-m7', name: 'M7 Blood Pressure Monitor', label: 'Patient monitoring' },
  { slug: 'dp-10-ultrasound', name: 'DP-10 Ultrasound', label: 'Mindray' },
  { slug: 'patient-monitor-comen', name: 'Patient Monitor', label: 'Critical care' },
  { slug: 'microscope-olympus-cx23', name: 'CX23 Microscope', label: 'Laboratory' },
  { slug: 'oxygen-cylinder-40l', name: 'Oxygen Cylinder 40L', label: 'Respiratory care' },
  { slug: 'emergency-trolley', name: 'Emergency Trolley', label: 'Hospital equipment' },
  { slug: 'cpap-machine', name: 'CPAP Machine', label: 'Respiratory care' },
];

/** The picture beside the text in the 'card' and 'carousel' hero styles (see heroStyle). */
export function MachineSlideshow() {
  return heroStyle === 'carousel' ? <MachineCarousel /> : <MachineCard />;
}

/** Tile colours, in turn: light mint, light sea, light sage (the hero photos have see-through backgrounds: public/images/hero, made by scripts/hero-cutouts.mjs). */
const tones = [
  { bg: 'bg-[#cfe3de]', brand: 'text-[#0b6b45]', name: 'text-[#16232a]', btn: 'bg-[#0b1418] text-white' },
  { bg: 'bg-[#d3e5e8]', brand: 'text-[#075056]', name: 'text-[#16232a]', btn: 'bg-[#0b1418] text-white' },
  { bg: 'bg-[#e2ebe3]', brand: 'text-[#0b6b45]', name: 'text-[#16232a]', btn: 'bg-[#0b1418] text-white' },
];

/**
 * Carousel: the current machine as a large tile with the next one peeking in at the side. Every few seconds the
 * current tile fades away while the next slides into its place. Pauses on hover or focus; swipe or use the bars.
 */
function MachineCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const n = machines.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => go(1), 4600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart the timer on every change
  }, [i, paused, reduce]);

  const shown = [i, (i + 1) % n];
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="relative h-[clamp(300px,calc(100svh-430px),460px)] overflow-hidden">
        <AnimatePresence initial={false}>
          {shown.map((k, pos) => {
            const m = machines[k];
            const t = tones[k % tones.length];
            const current = pos === 0;
            return (
              <motion.div
                key={m.slug}
                className="absolute inset-y-0 left-0 w-[78%] sm:w-[76%]"
                initial={{ x: '108%', opacity: 0 }}
                animate={{ x: current ? '0%' : '108%', opacity: current ? 1 : 0.92, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, x: '-6%' }}
                transition={{ duration: reduce ? 0 : 0.9, ease }}
                drag={current ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                aria-hidden={!current}
              >
                <Link
                  href={`/products/${m.slug}`}
                  tabIndex={current ? 0 : -1}
                  draggable={false}
                  className={cn('group relative flex h-full flex-col overflow-hidden rounded-[18px] p-6 transition-shadow duration-300 hover:shadow-[0_26px_50px_-26px_rgb(0_0_0/0.6)]', t.bg)}
                  aria-label={`${m.label} ${m.name}: view product`}
                >
                  <p className={cn('text-[0.8125rem] font-medium uppercase tracking-[0.08em]', t.brand)}>{m.label}</p>
                  <p className={cn('mt-1 max-w-[85%] text-xl font-semibold leading-snug', t.name)}>{m.name}</p>
                  <div className="relative mt-2 min-h-0 flex-1">
                    <Image src={`/images/hero/${m.slug}.webp`} alt="" fill priority={k === 0} loading={k === 0 ? undefined : 'eager'} sizes="(min-width: 1024px) 380px, 75vw" className="pointer-events-none object-contain p-4" draggable={false} />
                  </div>
                  <span className={cn('grid size-11 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1', t.btn)} aria-hidden>
                    <svg viewBox="0 0 16 16" className="size-4"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* Loads every photo up front (same sizes, so the tiles reuse them), so none appears late */}
      <div aria-hidden className="pointer-events-none invisible absolute size-px overflow-hidden">
        {machines.map((x) => <div key={x.slug} className="relative size-px"><Image src={`/images/hero/${x.slug}.webp`} alt="" fill loading="eager" sizes="(min-width: 1024px) 380px, 75vw" /></div>)}
      </div>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose a machine">
        {machines.map((x, k) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-label={`${x.name}`}
            onClick={() => setI(k)}
            className={cn('h-1.5 transition-all duration-500', k === i ? 'w-8 bg-brand-300' : 'w-3 bg-white/30 hover:bg-white/60')}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The card style: the equipment categories the CEO's review asks to feature (MRI, CT, mammography, X-ray, dialysis,
 * incubators, ventilators, ultrasound), one at a time in a still card that cross-fades every few seconds. Every
 * photo is in place from the start, so none appears late. Pauses on hover or focus.
 */
function MachineCard() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const m = equipment[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((n) => (n + 1) % equipment.length), 4200);
    return () => clearTimeout(id);
  }, [i, paused, reduce]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Link
        href="/services#equipment"
        className="group block overflow-hidden rounded-xl border border-white/10 bg-[#121d23] shadow-[0_18px_40px_-24px_rgb(0_0_0/0.6)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgb(0_0_0/0.7)] motion-reduce:hover:translate-y-0"
        aria-label={`${m.title}: see the equipment we supply`}
      >
        <div className="relative h-[clamp(240px,calc(100svh-520px),420px)] bg-[#F5F7F6]">
          {equipment.map((x, k) => (
            <motion.div
              key={x.slug}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: k === i ? 1 : 0, scale: k === i ? 1 : 1.03 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden={k !== i}
            >
              <Image src={x.image} alt={k === i ? x.title : ''} fill priority={k === 0} loading={k === 0 ? undefined : 'eager'} sizes="(min-width: 1024px) 480px, 90vw" className="object-cover" />
            </motion.div>
          ))}
        </div>
        <div className="flex items-baseline justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-brand-300">{m.group}</p>
            <p className="mt-1 truncate text-lg font-semibold leading-snug text-white">{m.title}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-white/75 transition group-hover:text-white">
            View <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </Link>

      <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Choose equipment">
        {equipment.map((x, n) => (
          <button
            key={x.slug}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={x.title}
            onClick={() => setI(n)}
            className={cn('h-1.5 transition-all duration-500', n === i ? 'w-8 bg-brand-300' : 'w-3 bg-white/30 hover:bg-white/60')}
          />
        ))}
      </div>
    </div>
  );
}
