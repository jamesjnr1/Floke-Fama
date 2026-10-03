'use client';

import { useEffect, useRef, useState } from 'react';

/** The hero's 3D pharmacy cross in its network rings, loaded lazily after hydration; fades in once ready. */
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
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[540px]">
      {/* Soft light behind the scene (also the look without WebGL) */}
      <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(52_161_116/0.3),rgb(0_77_59/0.2)_45%,transparent_70%)] blur-2xl" />
      <div ref={ref} aria-hidden className={`absolute inset-0 transition-opacity duration-[1400ms] ${ready ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
