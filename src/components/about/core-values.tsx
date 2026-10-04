'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { coreValues } from '@/data/seed';
import { cn } from '@/lib/utils';

/**
 * Core values as an expanding panel: one value opens wide with its full statement,
 * the others stay as tall labels. Hover, focus or tap to switch. Stacks on mobile.
 */
export function CoreValues() {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-12 flex flex-col gap-3 lg:min-h-[300px] lg:flex-row" role="tablist" aria-label="Core values">
      {coreValues.map((v, i) => {
        const on = i === active;
        return (
          <motion.button
            key={v.title}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={`value-${i}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            layout
            transition={{ layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
            className={cn(
              'group relative isolate overflow-hidden rounded-4xl border text-left transition-colors duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30',
              on ? 'border-line bg-paper shadow-[0_30px_60px_-34px_rgb(11_21_16/0.3)] lg:flex-[3.2]' : 'border-line bg-paper/60 hover:bg-paper lg:flex-1',
            )}
          >
            {/* Oversized watermark icon */}
            <Icon
              name={v.icon}
              className={cn(
                'pointer-events-none absolute -bottom-8 -right-6 -z-10 text-[13rem] transition-all duration-700 ease-out-expo',
                on ? 'text-brand-600/[0.07]' : 'text-brand-600/[0.04]',
              )}
            />
            <div className="flex h-full flex-col p-6 md:p-8">
              {/* The value's name sits beside its symbol; the statement fills the space below */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <span
                  className={cn(
                    'grid size-14 shrink-0 place-items-center rounded-2xl text-2xl transition-colors duration-500',
                    on ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700',
                  )}
                >
                  <Icon name={v.icon} />
                </span>
                <h3 className={cn('font-bold uppercase tracking-[0.06em] text-ink transition-all duration-500', on ? 'text-3xl md:text-4xl' : 'text-lg tracking-[0.03em]')}>{v.title}</h3>
              </div>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    id={`value-${i}`}
                    role="tabpanel"
                    className="mt-6 flex flex-1 flex-col"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.5 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    <p className="text-xl leading-relaxed text-ink-2 md:text-[1.375rem]">{v.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
