'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { CountUp } from '@/components/motion/count-up';
import { cn } from '@/lib/utils';

const chipPlaces: Record<string, string[]> = {
  globe: ['left-0 top-[14%]', 'right-0 top-[46%]', 'bottom-[10%] left-[8%]'],
};
const chips = [
  { value: 700, suffix: '+', label: 'Hospitals & labs served', className: 'left-0 top-[14%]' },
  { value: 300, suffix: '+', label: 'System integrations', className: 'right-0 top-[46%]' },
  { value: 6, suffix: '', label: 'Branches nationwide', className: 'bottom-[10%] left-[8%]' },
];

/** The 3D network globe, with floating glass read-outs of the published figures. */
export function HeroGlobe({ visual = 'globe', figures = true }: { visual?: 'globe' | 'capsule'; figures?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const done = () => setReady(true);
    if (visual === 'globe')
      import('@/lib/three/globe-scene').then(({ mountGlobe }) => {
        if (!cancelled && ref.current) cleanup = mountGlobe(ref.current, done);
      });
    else
      import('@/lib/three/capsule-scene').then(({ mountCapsule }) => {
        if (!cancelled && ref.current) cleanup = mountCapsule(ref.current, done);
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [visual]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[560px]">
      {/* Glow + CSS fallback sphere (visible until WebGL is ready, or if it isn't available) */}
      <div aria-hidden className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgb(82_181_124/0.35),rgb(19_66_40/0.25)_45%,transparent_70%)] blur-xl" />
      <div ref={ref} aria-hidden className={cn('absolute inset-0 transition-opacity duration-[1600ms]', ready ? 'opacity-100' : 'opacity-0')} />
      {figures && chips.map((c, i) => ({ ...c, className: (chipPlaces[visual] ?? chipPlaces.globe)[i] })).map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -8, 0] }}
          transition={reduce ? { delay: 0.6 + i * 0.15 } : { opacity: { delay: 0.6 + i * 0.15, duration: 0.6 }, y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i } }}
          className={cn('absolute rounded-xl border border-white/10 bg-midnight/60 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md', c.className)}
        >
          <p className="text-lg font-bold tracking-[-0.03em] text-white sm:text-2xl">
            <CountUp value={c.value} suffix={c.suffix} />
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/55">
            <span className="size-1.5 rounded-full bg-brand-400" aria-hidden /> {c.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
