'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** The 3D dotted capsule (medicines and equipment, distributed), loaded lazily in its own chunk. */
export function HeroCapsule() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/three/capsule-scene').then(({ mountCapsule }) => {
      if (!cancelled && ref.current) cleanup = mountCapsule(ref.current, () => setReady(true));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[560px]">
      {/* Soft glow behind the capsule (also the fallback if WebGL isn't available) */}
      <div aria-hidden className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgb(63_160_109/0.35),rgb(0_70_36/0.25)_45%,transparent_70%)] blur-xl" />
      <div ref={ref} aria-hidden className={cn('absolute inset-0 transition-opacity duration-[1600ms]', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  );
}
