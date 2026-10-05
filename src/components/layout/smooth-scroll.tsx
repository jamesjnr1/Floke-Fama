'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/a11y';

/**
 * Smooth scrolling for the public site (Lenis, standard setup). Every mouse wheel and trackpad gesture goes
 * through Lenis, so one engine moves the page from start to finish (mixing it with the browser's own
 * scrolling makes the page fight itself). It moves the real page scroll, so sticky elements, anchors and
 * the scrollbar keep working. Touch screens keep their native scrolling, and it switches off when the
 * visitor asks for less motion (here or in their OS settings).
 */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const start = () => {
      if (lenis.current || prefersReducedMotion()) return;
      lenis.current = new Lenis({
        lerp: 0.16,
        smoothWheel: true,
        wheelMultiplier: 1,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        autoRaf: true,
      });
    };
    const stop = () => {
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
    // Menus and dialogs lock the page with overflow: hidden; pause smooth scrolling while they are open
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

  // New page: start at the top immediately (no glide from the old position)
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
