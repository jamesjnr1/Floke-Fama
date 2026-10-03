'use client';

import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10); // 0–9 twice

/**
 * Odometer-style figure: each digit rolls up through a full turn of its wheel and lands on its value,
 * left to right, once the figure scrolls into view. The server renders the final value (each wheel
 * already on its digit), and the roll starts from the same digit one turn earlier, so the number is
 * never shown wrong, not even for a frame. Screen readers get the plain value.
 */
export function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  // 'rest' = on the digit (server and reduced motion), 'wound' = one turn back, 'rolling' = turning to it
  const [phase, setPhase] = useState<'rest' | 'wound' | 'rolling'>('rest');

  useEffect(() => {
    if (!inView || reduce) return;
    setPhase('wound');
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('rolling')));
    return () => cancelAnimationFrame(id);
  }, [inView, reduce]);

  const digits = String(value).split('');
  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{`${prefix}${value}${suffix}`}</span>
      <span aria-hidden className="inline-flex">
        {prefix}
        {digits.map((d, i) => {
          const n = Number(d);
          const index = phase === 'wound' ? n : n + 10;
          return (
            <span key={i} className="inline-block h-[1em] overflow-hidden">
              <span
                className="flex flex-col"
                style={{
                  transform: `translateY(-${index}em)`,
                  transition: phase === 'rolling' ? `transform ${1.5 + i * 0.25}s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s` : 'none',
                }}
              >
                {DIGITS.map((x, k) => (
                  <span key={k} className="block h-[1em] leading-[1em]">
                    {x}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
        {suffix}
      </span>
    </span>
  );
}
