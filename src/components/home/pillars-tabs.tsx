'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type Pillar = { title: string; body: string; points: readonly string[]; href: string; image: string; alt: string; product: boolean };

/** The four pillars as a list on the left; the chosen one opens large on the right with its photo and points. */
export function PillarsTabs({ pillars }: { pillars: readonly Pillar[] }) {
  const [active, setActive] = useState(0);
  const p = pillars[active];
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
      <ul role="tablist" aria-label="Four pillars" className="grid gap-2 self-start">
        {pillars.map((x, i) => {
          const on = i === active;
          return (
            <li key={x.title}>
              <button
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="pillar-panel"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn('flex w-full items-center gap-5 px-6 py-5 text-left transition-colors', on ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-brand-50')}
              >
                <span className={cn('text-sm font-semibold tabular-nums', on ? 'text-brand-100' : 'text-brand-700')}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-lg font-bold tracking-[-0.02em]">{x.title}</span>
                <Icon name="fi-rr-angle-small-right" className={cn('text-xl transition-transform', on ? 'translate-x-0.5 text-white' : 'text-ink-3')} />
              </button>
            </li>
          );
        })}
      </ul>

      <div id="pillar-panel" role="tabpanel" className="grid overflow-hidden bg-white md:grid-cols-2">
        <div className="relative aspect-[4/3] bg-white md:aspect-auto md:min-h-[400px]">
          <Image key={p.image} src={p.image} alt={p.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className={p.product ? 'object-contain p-8' : 'object-cover'} />
        </div>
        <div className="flex flex-col p-7 md:p-9">
          <p className="text-sm font-semibold tabular-nums text-brand-700">{String(active + 1).padStart(2, '0')} / {String(pillars.length).padStart(2, '0')}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink">{p.title}</h3>
          <p className="no-justify mt-3 leading-relaxed text-ink-3">{p.body}</p>
          <ul className="mt-5 space-y-2.5">
            {p.points.map((pt) => (
              <li key={pt} className="flex items-center gap-2.5 text-ink-2">
                <Icon name="fi-rr-check" className="text-brand-700" />
                {pt}
              </li>
            ))}
          </ul>
          <Link href={p.href} className="group mt-auto inline-flex items-center gap-1.5 pt-7 font-semibold text-brand-700 hover:text-brand-800">
            Explore {p.title}
            <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
