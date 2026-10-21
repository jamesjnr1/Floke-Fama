'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Award = { id: string; title: string; body: string; year: string; image: string; alt: string };

/** One award at a time, large, with its story beside it; the row of thumbnails underneath picks which. */
export function AwardsShowcase({ awards }: { awards: Award[] }) {
  const [i, setI] = useState(0);
  const a = awards[i];
  if (!a) return null;
  const go = (n: number) => setI((n + awards.length) % awards.length);
  return (
    <div>
      <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr] md:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden border border-line bg-white">
          <Image key={a.id} src={a.image} alt={a.alt} fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover object-[50%_35%]" priority={i === 0} />
        </div>
        <div aria-live="polite">
          <p className="label">{a.year}</p>
          <h3 className="display mt-3 text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)]">{a.title}</h3>
          <p className="no-justify mt-4 max-w-xl text-lg leading-relaxed text-ink-3">{a.body}</p>
          <div className="mt-8 flex items-center gap-3">
            <button type="button" onClick={() => go(i - 1)} aria-label="Previous award" className="grid size-12 place-items-center border border-line bg-white text-ink transition-colors hover:border-brand-700 hover:text-brand-700">
              <i className="fi fi-rr-arrow-small-left text-xl" aria-hidden />
            </button>
            <button type="button" onClick={() => go(i + 1)} aria-label="Next award" className="grid size-12 place-items-center bg-brand-700 text-white transition-colors hover:bg-brand-800">
              <i className="fi fi-rr-arrow-small-right text-xl" aria-hidden />
            </button>
            <p className="ml-3 font-medium tabular-nums text-ink-3">
              <span className="text-ink">{String(i + 1).padStart(2, '0')}</span> / {String(awards.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {awards.map((x, n) => (
          <li key={x.id}>
            <button
              type="button"
              onClick={() => setI(n)}
              aria-label={x.title}
              aria-current={n === i || undefined}
              className={cn('relative block aspect-square w-full overflow-hidden border-2 bg-white transition-[border-color,opacity]', n === i ? 'border-brand-700' : 'border-transparent opacity-60 hover:opacity-100')}
            >
              <Image src={x.image} alt="" fill sizes="140px" className="object-cover object-[50%_35%]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
