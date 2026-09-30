/** Mini sparkline for asset readings (demo data). */
export function Sparkline({ values, tone = '#10b981', className }: { values: number[]; tone?: string; className?: string }) {
  const w = 72, h = 24;
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className ?? 'h-6 w-[72px]'} aria-hidden>
      <polyline points={pts} fill="none" stroke={tone} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
