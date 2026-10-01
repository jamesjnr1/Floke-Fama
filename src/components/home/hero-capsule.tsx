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
      {/* Dark halo behind the capsule so the bright dots stand out on the photo (also the fallback if WebGL isn't available) */}
      <div aria-hidden className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(5_22_13/0.72),rgb(5_22_13/0.45)_45%,transparent_70%)] blur-2xl" />
      <div ref={ref} aria-hidden className={cn('absolute inset-0 transition-opacity duration-[1600ms]', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  );
}
