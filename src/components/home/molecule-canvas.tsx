'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Lazy-loads Three.js in its own chunk after hydration; a CSS glow shows until (or if never) ready. */
export function MoleculeCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/three/molecule-scene').then(({ mountMolecule }) => {
      if (!cancelled && ref.current) cleanup = mountMolecule(ref.current, () => setReady(true));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={cn('pointer-events-none relative', className)} aria-hidden>
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgb(111_227_166/0.4),rgb(37_120_71/0.2)_45%,transparent_70%)] blur-md" />
      <div ref={ref} className={cn('absolute inset-0 transition-opacity duration-[1400ms]', ready ? 'opacity-100' : 'opacity-0')} />
    </div>
  );
}
