'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { cn } from '@/lib/utils';

/**
 * Core values as an expanding panel: one value opens wide with its full statement, the others stay as tall
 * labels. Hover, focus or tap to switch. On large screens the panel has a fixed height and every statement
 * stays in the page (only faded), so switching never changes the page height: nothing below it jumps.
 * Phones stack all four, open.
 */
export function CoreValues() {
  const { coreValues } = useSite();
  const [active, setActive] = useState(0);
  return (
    <div className="mt-12 flex flex-col gap-3 lg:h-[330px] lg:flex-row" role="tablist" aria-label="Core values">
      {coreValues.map((v, i) => {
        const on = i === active;
        return (
          <button
            key={v.title}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls={`value-${i}`}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className={cn(
              'group relative isolate min-w-0 overflow-hidden rounded-4xl border border-line text-left transition-[flex-grow,background-color,box-shadow] duration-500 ease-out-expo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30 lg:basis-0',
              on ? 'bg-paper shadow-[0_30px_60px_-34px_rgb(11_21_16/0.3)] lg:grow-[3.2]' : 'bg-paper/60 hover:bg-paper lg:grow',
            )}
          >
            {/* Oversized watermark icon */}
            <Icon
              name={v.icon}
              className={cn('pointer-events-none absolute -bottom-8 -right-6 -z-10 text-[13rem] transition-colors duration-500', on ? 'text-brand-600/[0.07]' : 'text-brand-600/[0.04]')}
            />
            <div className="flex h-full flex-col p-6 md:p-8">
              <div className={cn('flex gap-5', on ? 'items-center' : 'items-center lg:flex-col lg:items-start')}>
                <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl text-2xl transition-colors duration-500', on ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700')}>
                  <Icon name={v.icon} />
                </span>
                <h3 className={cn('whitespace-nowrap font-bold uppercase tracking-[0.06em] text-ink', on ? 'text-2xl md:text-4xl' : 'text-2xl lg:text-lg lg:tracking-[0.03em]')}>{v.title}</h3>
              </div>
              {/* Fixed width, so the text does not re-wrap while the panel widens */}
              <p
                id={`value-${i}`}
                role="tabpanel"
                className={cn(
                  'mt-6 text-lg leading-relaxed text-ink-2 md:text-xl lg:w-[34rem] lg:text-[1.3125rem] lg:transition-opacity',
                  on ? 'lg:opacity-100 lg:delay-200 lg:duration-500' : 'lg:pointer-events-none lg:opacity-0 lg:duration-150',
                )}
              >
                {v.text}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
