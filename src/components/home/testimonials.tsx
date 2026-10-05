'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { useSite } from '@/components/site-provider';
import { cn } from '@/lib/utils';

const initials = (name: string) => name.replace(/^Dr\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('');

/** Testimonials from the current site: one quote in the spotlight, the speakers as a selector. */
export function Testimonials() {
  const { testimonials } = useSite();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const t = testimonials[active];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % testimonials.length), 8000);
    return () => clearTimeout(id);
  }, [active, paused, reduce, testimonials.length]);

  return (
    <section id="testimonials" className="scroll-mt-28 border-y border-line bg-paper py-14 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="display max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">Hear what our customers say.</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-3">Don’t just take our word for it—hear from our satisfied customers! Here’s what they have to say about their experience with Flokefama.</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="relative mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-5xl border border-line bg-paper shadow-[0_40px_80px_-50px_rgb(11_21_16/0.4)] lg:grid-cols-[1.6fr_1fr]"
          >
            <figure className="relative flex min-h-[340px] flex-col p-8 md:p-12">
              <span aria-hidden className="pointer-events-none absolute -top-6 left-6 select-none font-mono text-[10rem] leading-none text-brand-600/10">“</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex h-full flex-col justify-between"
                  aria-live="polite"
                >
                  <blockquote className="text-xl font-medium leading-relaxed tracking-[-0.01em] text-ink md:text-2xl">“{t.quote}”</blockquote>
                  <figcaption className="mt-10 flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{initials(t.name)}</span>
                    <span>
                      <span className="block font-semibold text-ink">{t.name}</span>
                      <span className="text-sm text-ink-3">{t.role}</span>
                    </span>
                  </figcaption>
                </motion.div>
              </AnimatePresence>
            </figure>

            <ul className="flex flex-col border-t border-line bg-canvas/60 p-3 lg:border-l lg:border-t-0" aria-label="Choose a testimonial">
              {testimonials.map((x, i) => (
                <li key={x.name} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className={cn('relative flex h-full w-full items-center gap-3 overflow-hidden rounded-3xl p-4 text-left transition', i === active ? 'bg-paper shadow-sm' : 'hover:bg-paper/60')}
                  >
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold transition', i === active ? 'bg-brand-600 text-white' : 'bg-mist text-ink-3')}>{initials(x.name)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{x.name}</span>
                      <span className="block truncate text-xs text-ink-3">{x.role}</span>
                    </span>
                    {i === active && !paused && !reduce && (
                      <motion.span
                        key={`bar-${active}`}
                        aria-hidden
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 8, ease: 'linear' }}
                        className="absolute inset-x-4 bottom-2 h-0.5 origin-left rounded-full bg-brand-500"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
