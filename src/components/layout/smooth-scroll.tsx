'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/a11y';

/**
 * Eased wheel scrolling for the public site (Lenis). It moves the real page scroll, so sticky elements,
 * anchors and the browser's own scrollbar keep working. Touch devices keep their native scrolling, and it
 * switches off when the visitor asks for less motion (here or in their OS settings).
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const start = () => {
      if (lenis.current || prefersReducedMotion()) return;
      lenis.current = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: true, allowNestedScroll: true });
      const loop = (t: number) => {
        lenis.current?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      lenis.current?.destroy();
      lenis.current = null;
    };
    start();
    // Follow the accessibility "Reduce motion" switch and the OS setting
    const sync = () => (prefersReducedMotion() ? stop() : start());
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', sync);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    // Menus and dialogs lock the page with overflow: hidden; pause the eased scroll while they are open
    const lock = new MutationObserver(() => {
      const locked = document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';
      if (locked) lenis.current?.stop();
      else lenis.current?.start();
    });
    lock.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    lock.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => {
      mq.removeEventListener('change', sync);
      mo.disconnect();
      lock.disconnect();
      stop();
    };
  }, []);

  // New page: start at the top immediately (no eased scroll from the old position)
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
