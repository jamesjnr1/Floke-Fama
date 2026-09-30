'use client';

import { Sparkline } from '@/components/portal/Sparkline';
import { statusMeta } from '@/components/portal/status';
import type { Asset } from '@/data/portal-demo';

/** System Status Rail: every installed system with a live status dot and a mini sparkline. */
export function AssetStatusList({ assets, onSelect }: { assets: Asset[]; onSelect: (a: Asset) => void }) {
  return (
    <ul className="space-y-2">
      {assets.map((a) => {
        const s = statusMeta[a.status];
        return (
          <li key={a.id}>
            <button
              onClick={() => onSelect(a)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
            >
              <span className={s.dot} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{a.name}</span>
                <span className="block truncate font-mono text-[11px] uppercase tracking-wider text-white/40">{a.location} · {s.label}</span>
              </span>
              <Sparkline values={a.readings} tone={s.tone} />
            </button>
          </li>
        );
      })}
      {assets.length === 0 && <li className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/40">No systems match your search.</li>}
    </ul>
  );
}
