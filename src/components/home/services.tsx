'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { serviceList as services } from '@/data/seed';
import { cn } from '@/lib/utils';

/**
 * Our services as one lifecycle: six stages on a rail. Selecting a stage (hover, focus or tap)
 * opens it in the panel below; the rail fills up to it. Cycles on its own until someone interacts.
 */
export function Services() {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const s = services[active];

  useEffect(() => {
    if (touched || reduce || !inView) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % services.length), 4500);
    return () => clearTimeout(id);
  }, [active, touched, reduce, inView]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  return (
    <section id="services" className="scroll-mt-20 border-y border-line bg-paper py-14 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="label">Our services</p>
            <h2 className="display mt-5 text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)]">
              We don’t just deliver. <span className="text-brand-600">We stay.</span>
            </h2>
          </div>
          <p className="max-w-sm font-light leading-relaxed text-ink-3">
            End-to-end solutions, from procurement and installation to training and maintenance, so every client gets the most out of their investment.
          </p>
        </Reveal>

        {/* Desktop: lifecycle rail + detail panel */}
        <div ref={ref} className="mt-16 hidden lg:block">
          <div className="relative">
            <div aria-hidden className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-6 h-px bg-line" />
            <motion.div
              aria-hidden
              className="absolute left-[calc(100%/12)] top-6 h-px origin-left bg-brand-500"
              animate={{ width: `${(active / (services.length - 1)) * (1000 / 12)}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <ol className="relative grid grid-cols-6" role="tablist" aria-label="Service lifecycle">
              {services.map((x, i) => {
                const on = i === active;
                const done = i < active;
                return (
                  <li key={x.title} className="flex justify-center">
                    <button
                      role="tab"
                      aria-selected={on}
                      aria-controls="service-panel"
                      onClick={() => pick(i)}
                      onMouseEnter={() => pick(i)}
                      onFocus={() => pick(i)}
                      className="group flex flex-col items-center gap-4 px-2 text-center focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'relative grid size-12 place-items-center rounded-full border font-mono text-sm transition-all duration-500',
                          on ? 'scale-110 border-brand-600 bg-brand-600 text-white shadow-[0_0_0_8px_rgb(37_120_71/0.12)]' : done ? 'border-brand-500 bg-paper text-brand-700' : 'border-line bg-paper text-ink-3 group-hover:border-ink/30',
                          'group-focus-visible:ring-4 group-focus-visible:ring-brand-500/30',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={cn('max-w-[11rem] text-sm font-medium leading-snug transition-colors', on ? 'text-ink' : 'text-ink-3 group-hover:text-ink')}>{x.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div id="service-panel" role="tabpanel" className="relative mt-12 overflow-hidden rounded-5xl bg-brand-800 bg-[linear-gradient(120deg,#18512f_0%,#0f3520_70%)] text-white">
            <div aria-hidden className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(82_181_124/0.22),transparent_65%)]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative grid grid-cols-[1fr_auto] items-center gap-10 p-12"
              >
                <div>
                  <p className="font-mono text-sm text-brand-300">Stage {String(active + 1).padStart(2, '0')} of {String(services.length).padStart(2, '0')}</p>
                  <h3 className="display mt-4 text-5xl text-white">{s.title}</h3>
                  <p className="mt-5 max-w-xl text-lg font-light leading-relaxed text-white/75">{s.body}</p>
                  <div className="mt-8 flex gap-3">
                    <Link href="/quote" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-medium text-brand-800 transition hover:bg-brand-50">
                      Request a quote <Icon name="fi-rr-arrow-small-right" />
                    </Link>
                    <Link href="/contact" className="glass inline-flex h-12 items-center rounded-xl px-6 text-[15px] text-white transition hover:bg-white/10">
                      Talk to an engineer
                    </Link>
                  </div>
                </div>
                <Icon name={s.icon} className="text-[11rem] leading-none text-brand-300/25" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: vertical lifecycle */}
        <ol className="mt-12 lg:hidden">
          {services.map((x, i) => (
            <li key={x.title} className="relative flex gap-5 pb-8 last:pb-0">
              {i < services.length - 1 && <span aria-hidden className="absolute left-5 top-11 h-[calc(100%-2.75rem)] w-px bg-line" />}
              <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-brand-500 bg-paper font-mono text-xs text-brand-700">{String(i + 1).padStart(2, '0')}</span>
              <div className="pt-1.5">
                <h3 className="text-lg font-semibold tracking-tight">{x.title}</h3>
                <p className="mt-1 text-sm font-light leading-relaxed text-ink-3">{x.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
