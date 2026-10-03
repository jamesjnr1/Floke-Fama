'use client';

import { useEffect, useRef, useState } from 'react';

/** The hero's 3D laboratory scene, loaded lazily after hydration; fades in once ready. */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/three/hero-scene').then(({ mountHeroScene }) => {
      if (!cancelled && ref.current) cleanup = mountHeroScene(ref.current, () => setReady(true));
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[640px]">
      {/* Soft light behind the scene (also the look without WebGL) */}
      <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(47_128_183/0.16),rgb(0_122_77/0.06)_50%,transparent_70%)] blur-2xl" />
      <div ref={ref} aria-hidden className={`absolute inset-0 transition-opacity duration-[1400ms] ${ready ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
