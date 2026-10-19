/**
 * Small charts for the admin console, in plain HTML: one series each, in the company green, with the value shown on
 * hover (and in the bar's title for screen readers).
 */
export function Columns({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure>
      <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`} className="flex h-40 items-end gap-1.5 border-b border-line">
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 items-end justify-center">
            <span className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap bg-ink px-2 py-1 text-[0.8125rem] font-medium text-white opacity-0 transition group-hover:opacity-100">
              {d.label}: {d.value}
            </span>
            <div title={`${d.label}: ${d.value}`} className="w-full max-w-7 rounded-t-[4px] bg-brand-600 transition group-hover:bg-brand-700" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-[0.8125rem] text-ink-3">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </figcaption>
    </figure>
  );
}

export function Bars({ data, empty = 'Nothing yet.' }: { data: { label: string; value: number; note?: string }[]; empty?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-ink-3">{empty}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
            <span className="truncate text-ink-2" title={d.label}>{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{d.value.toLocaleString()}{d.note && <span className="ml-1 font-normal text-ink-3">{d.note}</span>}</span>
          </div>
          <div className="mt-1 h-2 bg-mist">
            <div className="h-full rounded-r-[4px] bg-brand-600" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
