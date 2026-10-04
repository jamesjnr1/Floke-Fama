'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** The 3D dotted portable ultrasound (after the Mindray DP-10 in the Shop), loaded lazily in its own chunk. */
export function HeroUltrasound() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/three/icon-scene').then(({ mountIcon }) => {
      if (!cancelled && ref.current) cleanup = mountIcon(ref.current, 'ultrasound', () => setReady(true));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[min(540px,calc(100svh_-_260px))]">
      {/* Soft shade behind the machine so the light dots stand out on the photo (also the look without WebGL) */}
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgb(8_26_22/0.6),rgb(8_26_22/0.3)_45%,transparent_70%)] blur-2xl" />
      <div ref={ref} aria-hidden className={cn('absolute inset-0 transition-opacity duration-[1600ms]', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  );
}
