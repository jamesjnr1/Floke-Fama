'use client';

import { useState } from 'react';
import { Sparkline } from '@/components/service/Sparkline';
import { statusMeta } from '@/components/service/status';
import { cn } from '@/lib/utils';
import { assetStatus, dueLabel, daysUntil, isOpen, type AssetStatus, type EngineerState } from '@/lib/service/store';

/** System pulse: every installed system, filterable by status and facility. */
export function SystemsView({ state, onOpenAsset }: { state: EngineerState; onOpenAsset: (id: string) => void }) {
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const [facility, setFacility] = useState('all');
  const facilities = [...new Set(state.assets.map((a) => a.facility))];
  const list = state.assets.filter((a) => (status === 'all' || assetStatus(a, state.tickets) === status) && (facility === 'all' || a.facility === facility));

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'attention', 'maintenance', 'online'] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s} className={cn('rounded-lg px-3 py-1.5 text-xs transition', status === s ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white')}>
            {s === 'all' ? 'All systems' : statusMeta[s].label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs text-white/75">
          Facility
          <select value={facility} onChange={(e) => setFacility(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs text-white outline-none">
            <option value="all" className="bg-midnight">All facilities</option>
            {facilities.map((f) => <option key={f} className="bg-midnight">{f}</option>)}
          </select>
        </label>
      </div>
      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const st = assetStatus(a, state.tickets);
          const s = statusMeta[st];
          const open = state.tickets.filter((t) => t.assetId === a.id && isOpen(t)).length;
          const overdue = daysUntil(a.nextCalibration) < 0;
          return (
            <li key={a.id} className="min-w-0">
              <button onClick={() => onOpenAsset(a.id)} className="w-full rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-widest text-white/75"><span className={s.dot} /> {s.label}</span>
                  <span className="font-mono text-[0.8125rem] text-white/60">{a.id}</span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{a.name}</p>
                <p className="text-sm text-white/65">{a.facility} · {a.location}</p>
                <Sparkline values={a.readings} tone={s.tone} className="mt-5 h-16 w-full" />
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className={overdue ? 'text-signal' : 'text-white/65'}>Calibration: {dueLabel(a.nextCalibration)}</span>
                  <span className="text-white/65">{open} open ticket{open === 1 ? '' : 's'}</span>
                </div>
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/60">No systems match.</li>}
      </ul>
    </div>
  );
}
