'use client';

import Image from 'next/image';
import { useState } from 'react';
import { statusMeta } from '@/components/service/status';
import { Icon, IconTile } from '@/components/ui/icon';
import { assetImage, assetStatus, daysUntil, dueLabel, isOpen, type AssetStatus, type EngineerState } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const filters: (AssetStatus | 'all')[] = ['all', 'attention', 'maintenance', 'installing', 'online'];

/** Equipment: every system at every facility, filterable by status and facility. */
export function SystemsView({ state, onOpenAsset }: { state: EngineerState; onOpenAsset: (id: string) => void }) {
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const [facility, setFacility] = useState('all');
  const [q, setQ] = useState('');
  const facilities = [...new Set(state.assets.map((a) => a.facility))].sort();
  const term = q.trim().toLowerCase();
  const list = state.assets.filter(
    (a) =>
      (status === 'all' || assetStatus(a, state.tickets) === status) &&
      (facility === 'all' || a.facility === facility) &&
      (!term || `${a.name} ${a.brand} ${a.facility} ${a.location} ${a.serial}`.toLowerCase().includes(term)),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-11 min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-paper px-3.5 focus-within:border-brand-500">
          <Icon name="fi-rr-search" className="text-ink-3" />
          <span className="sr-only">Search equipment</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, facility or serial…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3/70" />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-3">
          Facility
          <select value={facility} onChange={(e) => setFacility(e.target.value)} className="h-11 rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none">
            <option value="all">All facilities</option>
            {facilities.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-5 overflow-x-auto border-b border-line" role="tablist" aria-label="Equipment status">
        {filters.map((s) => {
          const n = s === 'all' ? state.assets.length : state.assets.filter((a) => assetStatus(a, state.tickets) === s).length;
          return (
            <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatus(s)} className={cn('-mb-px shrink-0 border-b-2 py-2.5 text-sm', status === s ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
              {s === 'all' ? 'All' : statusMeta[s].label} <span className="ml-0.5 tabular-nums text-ink-3">{n}</span>
            </button>
          );
        })}
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const st = statusMeta[assetStatus(a, state.tickets)];
          const open = state.tickets.filter((t) => t.assetId === a.id && isOpen(t)).length;
          const cal = daysUntil(a.nextCalibration);
          const img = assetImage(a);
          return (
            <li key={a.id} className="min-w-0">
              <button onClick={() => onOpenAsset(a.id)} className="flex h-full w-full flex-col rounded-xl border border-line bg-paper p-2 text-left transition hover:border-ink/20">
                <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-md bg-white">
                  {img ? <Image src={img} alt="" fill sizes="(min-width: 1280px) 30vw, 50vw" className="object-contain p-6" /> : <IconTile name="fi-rr-microscope" />}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-medium text-[#16232a]">
                    <span className={cn('size-1.5 rounded-[1px]', st.dot)} aria-hidden /> {st.label}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs text-ink-3">{a.facility} · {a.location}</p>
                  <p className="mt-0.5 font-semibold text-ink">{a.name}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-ink-3">Serial</dt><dd className="mt-0.5 truncate font-medium text-ink">{a.serial}</dd></div>
                    <div><dt className="text-ink-3">Calibration</dt><dd className={cn('mt-0.5 font-medium', !a.installation && cal < 0 ? 'text-bad' : 'text-ink')}>{a.installation ? 'After install' : dueLabel(a.nextCalibration).replace('Due in ', 'In ')}</dd></div>
                    <div><dt className="text-ink-3">Requests</dt><dd className="mt-0.5 font-medium text-ink">{open}</dd></div>
                  </dl>
                </div>
              </button>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-3 sm:col-span-2 xl:col-span-3">
            {state.assets.length === 0 ? 'No equipment yet. Systems appear here once hospitals buy them.' : 'No equipment matches.'}
          </li>
        )}
      </ul>
    </div>
  );
}
