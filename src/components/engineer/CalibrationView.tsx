'use client';

import { GhostButton, Panel } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { daysUntil, dueLabel, fmtDate, type Asset, type EngineerState } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Calibration schedule: soonest first, overdue flagged, record a result in one click. */
export function CalibrationView({ state, onRecord, onOpenAsset }: { state: EngineerState; onRecord: (a: Asset) => void; onOpenAsset: (id: string) => void }) {
  const rows = state.assets.filter((a) => !a.installation).sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration));
  const overdue = rows.filter((a) => daysUntil(a.nextCalibration) < 0).length;
  const soon = rows.filter((a) => { const d = daysUntil(a.nextCalibration); return d >= 0 && d <= 30; }).length;
  const stats = [
    { label: 'Overdue', value: overdue, tone: overdue ? 'text-bad' : 'text-ink' },
    { label: 'Due in 30 days', value: soon, tone: soon ? 'text-warn' : 'text-ink' },
    { label: 'Certificates on record', value: state.assets.reduce((n, a) => n + a.certificates.length, 0), tone: 'text-ink' },
  ];

  return (
    <div className="space-y-6">
      <ul className="grid grid-cols-3 overflow-hidden rounded-xl border border-line bg-paper">
        {stats.map((s, i) => (
          <li key={s.label} className={cn('min-w-0 p-5 md:p-6', i > 0 && 'border-l border-line')}>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.09em] text-ink-3">{s.label}</p>
            <p className={cn('mt-3 text-[2rem] font-semibold leading-none tracking-[-0.04em] tabular-nums', s.tone)}>{s.value}</p>
          </li>
        ))}
      </ul>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">Calibration schedule</caption>
            <thead>
              <tr className="border-b border-line bg-canvas text-left">
                {['System', 'Facility', 'Last', 'Next due', 'Interval', ''].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => {
                const d = daysUntil(a.nextCalibration);
                return (
                  <tr key={a.id} className="transition hover:bg-canvas">
                    <td className="px-5 py-4">
                      <button onClick={() => onOpenAsset(a.id)} className="text-left font-medium text-ink hover:underline">{a.name}</button>
                      <span className="block font-mono text-xs text-ink-3">{a.serial}</span>
                    </td>
                    <td className="px-5 py-4 text-ink-2">{a.facility}<span className="block text-xs text-ink-3">{a.location}</span></td>
                    <td className="px-5 py-4 text-ink-2">{fmtDate(a.lastCalibration)}</td>
                    <td className="px-5 py-4">
                      <span className="text-ink">{fmtDate(a.nextCalibration)}</span>
                      <span className={cn('block text-xs', d < 0 ? 'font-semibold text-bad' : d <= 30 ? 'font-medium text-warn' : 'text-ink-3')}>{dueLabel(a.nextCalibration)}</span>
                    </td>
                    <td className="px-5 py-4 text-ink-2">{a.intervalMonths} months</td>
                    <td className="px-5 py-4 text-right">
                      <GhostButton onClick={() => onRecord(a)} className="px-3 py-2 text-xs"><Icon name="fi-rr-badge-check" /> Record</GhostButton>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ink-3">No equipment to calibrate yet. Dates are scheduled when systems are installed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
