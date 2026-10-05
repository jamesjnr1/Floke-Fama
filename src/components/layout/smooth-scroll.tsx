'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/a11y';

/**
 * Eased mouse-wheel scrolling for the public site (Lenis). It moves the real page scroll, so sticky elements,
 * anchors and the browser's own scrollbar keep working. Trackpads and touch screens keep their native
 * scrolling (they already glide; easing them again feels like lag), and it switches off when the visitor
 * asks for less motion (here or in their OS settings).
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const start = () => {
      if (lenis.current || prefersReducedMotion()) return;
      lenis.current = new Lenis({
        lerp: 0.18,
        wheelMultiplier: 1,
        anchors: true,
        allowNestedScroll: true,
        // Trackpads send small or fractional pixel deltas; a mouse wheel sends whole notches (about 100px).
        // Returning false hands the event back to the browser's own scrolling.
        virtualScroll: ({ event }) => {
          if (!(event instanceof WheelEvent) || event.deltaMode !== 0) return true;
          const d = Math.abs(event.deltaY);
          return Number.isInteger(event.deltaY) && d >= 50;
        },
      });
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
