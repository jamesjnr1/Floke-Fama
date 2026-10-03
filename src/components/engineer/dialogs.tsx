'use client';

import { useEffect, useState } from 'react';
import { Field, fieldClass, GhostButton, PortalDialog, PrimaryButton } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import type { Asset, Certificate, Priority, Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Log a new equipment fault against an installed system. */
export function LogFaultDialog({ open, onOpenChange, assets, defaultAssetId, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assets: Asset[];
  defaultAssetId?: string;
  onSubmit: (v: { assetId: string; description: string; priority: Priority; assignToMe: boolean }) => void;
}) {
  const [assetId, setAssetId] = useState(defaultAssetId ?? assets[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [assignToMe, setAssignToMe] = useState(true);
  useEffect(() => {
    if (open) {
      setAssetId(defaultAssetId ?? assets[0]?.id ?? '');
      setDescription('');
    }
  }, [open, defaultAssetId, assets]);

  return (
    <PortalDialog open={open} onOpenChange={onOpenChange} title="Log equipment fault" description="The ticket is created immediately and appears in the service queue.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!description.trim()) return;
          onSubmit({ assetId, description: description.trim(), priority, assignToMe });
          onOpenChange(false);
        }}
        className="space-y-4"
      >
        <Field label="System">
          <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={cn(fieldClass, 'h-11')}>
            {assets.map((a) => <option key={a.id} value={a.id} className="bg-midnight">{a.name} · {a.facility}</option>)}
          </select>
        </Field>
        <Field label="What’s happening?">
          <textarea required autoFocus value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="e.g. Error code E-21 on start-up" className={cn(fieldClass, 'py-2.5')} />
        </Field>
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-widest text-white/75">Priority</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['critical', 'high', 'routine'] as const).map((p) => (
              <button key={p} type="button" aria-pressed={priority === p} onClick={() => setPriority(p)} className={cn('rounded-xl border px-3 py-2 text-sm capitalize transition', priority === p ? 'border-brand-500 bg-brand-500/15 text-white' : 'border-white/10 text-white/75 hover:border-white/25')}>
                {p}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input type="checkbox" checked={assignToMe} onChange={(e) => setAssignToMe(e.target.checked)} className="size-4 accent-[#257847]" />
          Assign to me
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={!description.trim()}>Log fault</PrimaryButton>
        </div>
      </form>
    </PortalDialog>
  );
}

/** Close a ticket with a service summary (sent to the facility as the service report). */
export function ResolveDialog({ ticket, onOpenChange, onSubmit }: {
  ticket: Ticket | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (v: { summary: string; calibrated: boolean }) => void;
}) {
  const [summary, setSummary] = useState('');
  const [calibrated, setCalibrated] = useState(false);
  useEffect(() => {
    setSummary('');
    setCalibrated(false);
  }, [ticket]);
  return (
    <PortalDialog open={Boolean(ticket)} onOpenChange={onOpenChange} title={`Resolve ${ticket?.id ?? ''}`} description="Your summary becomes the service report sent to the facility.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!summary.trim()) return;
          onSubmit({ summary: summary.trim(), calibrated });
        }}
        className="space-y-4"
      >
        <Field label="Work carried out">
          <textarea required autoFocus value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="Root cause, what you replaced or adjusted, tests passed…" className={cn(fieldClass, 'py-2.5')} />
        </Field>
        {ticket && ticket.parts.length > 0 && (
          <p className="text-xs text-white/75">Parts on this ticket: {ticket.parts.map((p) => `${p.qty} × ${p.name}`).join(', ')}</p>
        )}
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input type="checkbox" checked={calibrated} onChange={(e) => setCalibrated(e.target.checked)} className="size-4 accent-[#257847]" />
          Calibration performed and passed (issues a certificate)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={!summary.trim()}><Icon name="fi-rr-check" /> Resolve ticket</PrimaryButton>
        </div>
      </form>
    </PortalDialog>
  );
}

/** Record a calibration result for a system. */
export function CalibrationDialog({ asset, onOpenChange, onSubmit }: {
  asset: Asset | null;
  onOpenChange: (v: boolean) => void;
  onSubmit: (v: { result: Certificate['result']; notes?: string }) => void;
}) {
  const [result, setResult] = useState<Certificate['result']>('Pass');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    setResult('Pass');
    setNotes('');
  }, [asset]);
  return (
    <PortalDialog open={Boolean(asset)} onOpenChange={onOpenChange} title="Record calibration" description={asset ? `${asset.name} · ${asset.facility}` : undefined}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ result, notes: notes.trim() || undefined });
        }}
        className="space-y-4"
      >
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-widest text-white/75">Result</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['Pass', 'Adjusted'] as const).map((r) => (
              <button key={r} type="button" aria-pressed={result === r} onClick={() => setResult(r)} className={cn('rounded-xl border px-3 py-2.5 text-sm transition', result === r ? 'border-brand-500 bg-brand-500/15 text-white' : 'border-white/10 text-white/75 hover:border-white/25')}>
                {r === 'Pass' ? 'Pass (in tolerance)' : 'Adjusted to tolerance'}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Notes (optional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Reference standards used, readings, adjustments…" className={cn(fieldClass, 'py-2.5')} />
        </Field>
        {asset && <p className="text-xs text-white/65">Next calibration will be scheduled in {asset.intervalMonths} months.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton type="submit"><Icon name="fi-rr-badge-check" /> Issue certificate</PrimaryButton>
        </div>
      </form>
    </PortalDialog>
  );
}
