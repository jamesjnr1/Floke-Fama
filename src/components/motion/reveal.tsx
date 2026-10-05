'use client';

import { useEffect, useRef } from 'react';

/** One observer for every Reveal on the page. */
let observer: IntersectionObserver | null = null;
const watch = (el: Element) => {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute('data-shown', '');
        observer?.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -5% 0px' },
  );
  observer.observe(el);
  return () => observer?.unobserve(el);
};

/**
 * Fade-and-rise when scrolled into view. Pure CSS transitions (see `[data-reveal]` in globals.css), started by
 * a shared IntersectionObserver: no JavaScript animation runs while the page scrolls, so smooth scrolling stays
 * smooth. Content is only hidden once the page script is ready (`html[data-reveal-ready]`), and reduced motion
 * (the OS setting or the site's own switch) shows everything at once.
 */
export function Reveal({ delay = 0, y = 16, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? watch(ref.current) : undefined), []);
  return <div ref={ref} data-reveal="" style={{ '--reveal-delay': `${delay}s`, '--reveal-y': `${y}px`, ...style } as React.CSSProperties} {...props} />;
}
