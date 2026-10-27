import { cn } from '@/lib/utils';

/**
 * Small charts for the admin console, in plain HTML: one series each, in the company green, with the value shown on
 * hover (and in the bar's title for screen readers).
 */

/** Weekly columns: above-average weeks solid green, the rest hatched; the best week carries its value. */
export function Columns({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const avg = data.reduce((n, d) => n + d.value, 0) / Math.max(1, data.length);
  const best = data.findIndex((d) => d.value === max);
  return (
    <figure>
      <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`} className="flex h-56 items-end gap-2 pt-8 sm:gap-3">
        {data.map((d, i) => {
          const strong = d.value >= avg && d.value > 0;
          return (
            <div key={d.label} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <span
                className={
                  i === best
                    ? 'absolute z-10 -translate-y-[calc(100%+6px)] rounded-md border border-[#9fdcbb] bg-[#effaf4] px-1.5 py-0.5 text-[0.8125rem] font-semibold text-brand-700'
                    : 'pointer-events-none absolute z-10 -translate-y-[calc(100%+6px)] rounded-md bg-ink px-1.5 py-0.5 text-[0.8125rem] font-semibold text-white opacity-0 transition group-hover:opacity-100'
                }
                style={{ bottom: `${(d.value / max) * 100}%` }}
              >
                {d.value}
              </span>
              <div
                title={`${d.label}: ${d.value}`}
                className={
                  strong
                    ? 'w-full max-w-12 rounded-full bg-[linear-gradient(180deg,#0d6b42_0%,#06482a_60%,#04331f_100%)] transition group-hover:brightness-125'
                    : 'w-full max-w-12 rounded-full border border-[#dfe5e2] bg-[repeating-linear-gradient(135deg,#ffffff_0_5px,#e3e8e5_5px_6.5px)] transition group-hover:border-brand-300'
                }
                style={{ height: `${Math.max((d.value / max) * 100, 10)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {data.map((d, i) => (
          // On a phone every other date is left out, so the dates never push the chart wider than the screen
          <span key={d.label} className={cn('min-w-0 flex-1 whitespace-nowrap text-center text-[0.8125rem] text-ink-3', i % 2 === 1 && data.length > 6 && 'max-sm:invisible')}>
            {i % 2 === 0 || data.length <= 8 ? d.label : ''}
          </span>
        ))}
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-ink-3">
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-brand-800" /> Above the 12-week average</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded-full border border-[#dfe5e2] bg-[repeating-linear-gradient(135deg,#fff_0_2px,#d5ddd9_2px_3px)]" /> Below average</span>
      </figcaption>
    </figure>
  );
}

export function Bars({ data, empty = 'Nothing yet.' }: { data: { label: string; value: number; note?: string }[]; empty?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-ink-3">{empty}</p>;
  return (
    <ul className="space-y-4">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
            <span className="truncate text-ink-2" title={d.label}>{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{d.value.toLocaleString()}{d.note && <span className="ml-1 font-normal text-ink-3">{d.note}</span>}</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-[#edf1ef]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#0d7a4b,#04331f)]" style={{ width: `${Math.max((d.value / max) * 100, d.value ? 3 : 0)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
