'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Lazy-loads the header's 3D sphere after hydration; fades in once ready. */
export function OrbCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/three/orb-scene').then(({ mountOrb }) => {
      if (!cancelled && ref.current) cleanup = mountOrb(ref.current, () => setReady(true));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={ref} aria-hidden className={cn('pointer-events-none transition-opacity duration-[1600ms]', ready ? 'opacity-100' : 'opacity-0', className)} />;
}
