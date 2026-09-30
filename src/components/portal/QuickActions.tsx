'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import type { Asset, Ticket } from '@/data/portal-demo';
import { cn } from '@/lib/utils';

/** Primary Terminal Button (dashed) + log-fault dialog. */
export function LogFaultButton({ assets, onCreate }: { assets: Asset[]; onCreate: (t: Ticket) => void }) {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('high');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === assetId);
    if (!asset || !description.trim()) return;
    onCreate({
      id: `TK-${1045 + Math.floor(Math.random() * 900)}`,
      assetId,
      title: `${asset.name}: ${description.trim()}`,
      priority,
      opened: 'Just now',
      steps: [{ label: 'Log ticket', detail: description.trim() }, { label: 'Engineer assigned' }, { label: 'On-site diagnostics' }, { label: 'Resolution' }],
      current: 1,
    });
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="group w-full rounded-2xl border border-dashed border-neon-400/50 bg-transparent px-5 py-6 font-mono text-sm text-neon-300 transition hover:border-neon-400 hover:bg-neon-500/10">
        [ <span className="text-white">+ Log New Equipment Fault</span> ]
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#111a2e] p-6 text-white shadow-2xl outline-none md:p-8">
          <Dialog.Title className="text-2xl font-bold tracking-[-0.02em] text-white">Log equipment fault</Dialog.Title>
          <p className="mt-1 text-sm text-white/50">Our coordinators will assign the nearest available engineer.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">System</span>
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-neon-500">
                {assets.map((a) => <option key={a.id} value={a.id} className="bg-midnight">{a.name} · {a.location}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">What’s happening?</span>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="e.g. Error code on start-up" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-neon-500" />
            </label>
            <fieldset>
              <legend className="font-mono text-[11px] uppercase tracking-widest text-white/50">Priority</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['critical', 'high', 'routine'] as const).map((p) => (
                  <button key={p} type="button" aria-pressed={priority === p} onClick={() => setPriority(p)} className={cn('rounded-xl border px-3 py-2 text-sm capitalize transition', priority === p ? 'border-neon-500 bg-neon-500/15 text-white' : 'border-white/10 text-white/60 hover:border-white/25')}>
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close className="rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white">Cancel</Dialog.Close>
              <button type="submit" className="rounded-xl bg-neon-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-neon-500">Log fault</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Radial Efficiency Progress Chart. */
export function RadialUptime({ value, label }: { value: number; label: string }) {
  const reduce = useReducedMotion();
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">Fleet efficiency</p>
      <div className="relative mx-auto mt-4 size-48">
        <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`${value}% uptime`}>
          <defs>
            <linearGradient id="uptime" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="12" />
          <motion.circle
            cx="90" cy="90" r={r} fill="none" stroke="url(#uptime)" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduce ? c * (1 - value / 100) : c }}
            animate={{ strokeDashoffset: c * (1 - value / 100) }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-4xl font-bold tracking-[-0.03em] text-white">{value}%</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-surgical">Uptime</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-white/40">{label}</p>
    </div>
  );
}
