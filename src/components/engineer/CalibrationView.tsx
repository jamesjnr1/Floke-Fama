'use client';

import { GhostButton, Panel } from '@/components/engineer/ui';
import { Icon } from '@/components/ui/icon';
import { daysUntil, dueLabel, fmtDate, type Asset, type EngineerState } from '@/lib/engineer/store';
import { cn } from '@/lib/utils';

/** Calibration schedule: soonest first, overdue flagged, record a result in one click. */
export function CalibrationView({ state, onRecord, onOpenAsset }: { state: EngineerState; onRecord: (a: Asset) => void; onOpenAsset: (id: string) => void }) {
  const rows = [...state.assets].sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration));
  const overdue = rows.filter((a) => daysUntil(a.nextCalibration) < 0).length;
  const soon = rows.filter((a) => { const d = daysUntil(a.nextCalibration); return d >= 0 && d <= 30; }).length;

  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Overdue', overdue, overdue > 0],
          ['Due in 30 days', soon, false],
          ['Certificates on record', state.assets.reduce((n, a) => n + a.certificates.length, 0), false],
        ].map(([label, value, alert]) => (
          <Panel key={String(label)} className="p-5">
            <p className={cn('text-3xl font-bold tracking-[-0.03em]', alert ? 'text-signal' : 'text-white')}>{String(value)}</p>
            <p className="mt-1 text-sm text-white/55">{label}</p>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">Calibration schedule</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-left">
                {['System', 'Facility', 'Last', 'Next due', 'Interval', ''].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 font-mono text-[11px] font-normal uppercase tracking-widest text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((a) => {
                const d = daysUntil(a.nextCalibration);
                return (
                  <tr key={a.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <button onClick={() => onOpenAsset(a.id)} className="text-left font-medium text-white hover:text-brand-300">{a.name}</button>
                      <span className="block font-mono text-[11px] text-white/35">{a.serial}</span>
                    </td>
                    <td className="px-5 py-4 text-white/60">{a.facility}<span className="block text-xs text-white/35">{a.location}</span></td>
                    <td className="px-5 py-4 text-white/60">{fmtDate(a.lastCalibration)}</td>
                    <td className="px-5 py-4">
                      <span className="text-white/80">{fmtDate(a.nextCalibration)}</span>
                      <span className={cn('block text-xs', d < 0 ? 'text-signal' : d <= 30 ? 'text-brand-300' : 'text-white/35')}>{dueLabel(a.nextCalibration)}</span>
                    </td>
                    <td className="px-5 py-4 text-white/60">{a.intervalMonths} months</td>
                    <td className="px-5 py-4 text-right">
                      <GhostButton onClick={() => onRecord(a)} className="px-3 py-2 text-xs"><Icon name="fi-rr-badge-check" /> Record</GhostButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
