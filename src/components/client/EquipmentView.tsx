'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon, IconTile } from '@/components/ui/icon';
import { assetImage, assetStatus, daysUntil, dueLabel, isOpen, type Asset, type AssetStatus, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const label: Record<AssetStatus, { text: string; dot: string }> = {
  online: { text: 'Operational', dot: 'bg-[#0b8a58]' },
  attention: { text: 'Service requested', dot: 'bg-[#d39a1c]' },
  maintenance: { text: 'Engineer on site', dot: 'bg-[#2f6fa8]' },
  installing: { text: 'Awaiting installation', dot: 'bg-[#7c6bc4]' },
};

/** Installed equipment: health, warranty and calibration for every system at the facility. */
export function EquipmentView({ assets, tickets, onOpenAsset }: { assets: Asset[]; tickets: Ticket[]; onOpenAsset: (id: string) => void }) {
  const [q, setQ] = useState('');
  const list = assets.filter((a) => `${a.name} ${a.brand} ${a.location} ${a.serial}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
      <label className="flex h-11 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-line bg-paper px-3.5 focus-within:border-brand-500">
        <Icon name="fi-rr-search" className="text-ink-3" />
        <span className="sr-only">Search equipment</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, location or serial…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3/70" />
      </label>
      <Link href="/products" className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink hover:border-ink/30">
        <Icon name="fi-rr-shopping-cart" className="text-ink-3" /> Buy equipment
      </Link>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const st = label[assetStatus(a, tickets)];
          const open = tickets.filter((t) => t.assetId === a.id && isOpen(t)).length;
          const cal = daysUntil(a.nextCalibration);
          const warranty = daysUntil(a.warrantyUntil) >= 0;
          return (
            <li key={a.id} className="min-w-0">
              <button onClick={() => onOpenAsset(a.id)} className="flex h-full w-full flex-col rounded-xl border border-line bg-paper p-2 text-left transition hover:border-ink/20 hover:shadow-[0_24px_48px_-32px_rgb(11_21_16/0.45)]">
                <div className="relative grid aspect-[16/9] place-items-center overflow-hidden bg-white">
                  {assetImage(a) ? <Image src={assetImage(a)!} alt="" fill sizes="(min-width: 1280px) 30vw, 50vw" className="object-contain p-6" /> : <IconTile name="fi-rr-microscope" />}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink">
                    <span className={cn('size-1.5 rounded-md', st.dot)} aria-hidden /> {st.text}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs text-ink-3">{a.brand} · {a.location}</p>
                  <p className="mt-0.5 font-semibold text-ink">{a.name}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-ink-3">Calibration</dt><dd className={cn('mt-0.5 font-medium', !a.installation && cal < 0 ? 'text-signal-700' : 'text-ink')}>{a.installation ? 'After install' : dueLabel(a.nextCalibration).replace('Due in ', 'In ')}</dd></div>
                    <div><dt className="text-ink-3">Warranty</dt><dd className="mt-0.5 font-medium text-ink">{a.installation ? 'Starts at install' : warranty ? 'Active' : 'Ended'}</dd></div>
                    <div><dt className="text-ink-3">Open requests</dt><dd className="mt-0.5 font-medium text-ink">{open}</dd></div>
                  </dl>
                </div>
              </button>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-3 sm:col-span-2 xl:col-span-3">
            {assets.length === 0 ? <>No equipment yet. Machines you buy from Flokefama appear here automatically. <Link href="/products" className="font-medium text-brand-700 hover:underline">Shop equipment</Link></> : <>No equipment matches “{q}”.</>}
          </li>
        )}
      </ul>
    </div>
  );
}
