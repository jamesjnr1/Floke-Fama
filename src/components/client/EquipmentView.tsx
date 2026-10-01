'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon, IconTile } from '@/components/ui/icon';
import { assetStatus, daysUntil, dueLabel, isOpen, type Asset, type AssetStatus, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const label: Record<AssetStatus, { text: string; dot: string }> = {
  online: { text: 'Operational', dot: 'bg-brand-500' },
  attention: { text: 'Service requested', dot: 'bg-signal' },
  maintenance: { text: 'Engineer on site', dot: 'bg-ink-3' },
};

/** Installed equipment: health, warranty and calibration for every system at the facility. */
export function EquipmentView({ assets, tickets, onOpenAsset }: { assets: Asset[]; tickets: Ticket[]; onOpenAsset: (id: string) => void }) {
  const [q, setQ] = useState('');
  const list = assets.filter((a) => `${a.name} ${a.brand} ${a.location} ${a.serial}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <label className="flex h-11 max-w-md items-center gap-2 rounded-xl border border-line bg-paper px-3.5 focus-within:border-brand-500">
        <Icon name="fi-rr-search" className="text-ink-3" />
        <span className="sr-only">Search equipment</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, location or serial…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3/70" />
      </label>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const st = label[assetStatus(a, tickets)];
          const open = tickets.filter((t) => t.assetId === a.id && isOpen(t)).length;
          const cal = daysUntil(a.nextCalibration);
          const warranty = daysUntil(a.warrantyUntil) >= 0;
          return (
            <li key={a.id} className="min-w-0">
              <button onClick={() => onOpenAsset(a.id)} className="flex h-full w-full flex-col rounded-3xl border border-line bg-paper p-2 text-left transition hover:border-ink/20 hover:shadow-[0_24px_48px_-32px_rgb(0_40_21/0.45)]">
                <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(90%_70%_at_50%_35%,#fff,#eaf3ee)]">
                  {a.image ? <Image src={a.image} alt="" fill sizes="(min-width: 1280px) 30vw, 50vw" className="object-contain p-6 mix-blend-multiply" /> : <IconTile name="fi-rr-microscope" />}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur">
                    <span className={cn('size-1.5 rounded-full', st.dot)} aria-hidden /> {st.text}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs text-ink-3">{a.brand} · {a.location}</p>
                  <p className="mt-0.5 font-semibold text-ink">{a.name}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-ink-3">Calibration</dt><dd className={cn('mt-0.5 font-medium', cal < 0 ? 'text-signal-700' : 'text-ink')}>{dueLabel(a.nextCalibration).replace('Due in ', 'In ')}</dd></div>
                    <div><dt className="text-ink-3">Warranty</dt><dd className="mt-0.5 font-medium text-ink">{warranty ? 'Active' : 'Ended'}</dd></div>
                    <div><dt className="text-ink-3">Open requests</dt><dd className="mt-0.5 font-medium text-ink">{open}</dd></div>
                  </dl>
                </div>
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="rounded-3xl border border-dashed border-line p-8 text-center text-sm text-ink-3">No equipment matches “{q}”.</li>}
      </ul>
    </div>
  );
}
