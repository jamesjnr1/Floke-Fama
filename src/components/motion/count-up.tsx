'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

/** Counts up once visible. Server-renders the final value, so it can never show "0". The number is written
 * straight to the page (no React re-render per frame), so it costs nothing while the page scrolls. */
export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const num = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const controls = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => {
        if (num.current) num.current.textContent = String(Math.round(v));
      } });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <span ref={num}>{value}</span>
      {suffix}
    </span>
  );
}
