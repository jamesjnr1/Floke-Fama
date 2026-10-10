'use client';

import { useEffect, useState } from 'react';
import { choiceClass, Field, fieldClass, GhostButton, PortalDialog, PrimaryButton } from '@/components/service/ui';
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
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.facility}</option>)}
          </select>
        </Field>
        <Field label="What’s happening?">
          <textarea required autoFocus value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="e.g. Error code E-21 on start-up" className={cn(fieldClass, 'py-2.5')} />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium text-ink-2">Priority</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['critical', 'high', 'routine'] as const).map((p) => (
              <button key={p} type="button" aria-pressed={priority === p} onClick={() => setPriority(p)} className={cn(choiceClass(priority === p), 'capitalize')}>
                {p}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 text-sm text-ink-2">
          <input type="checkbox" checked={assignToMe} onChange={(e) => setAssignToMe(e.target.checked)} className="size-4 accent-[#007a4d]" />
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
          <p className="text-xs text-ink-3">Parts on this ticket: {ticket.parts.map((p) => `${p.qty} × ${p.name}`).join(', ')}</p>
        )}
        <label className="flex items-center gap-3 text-sm text-ink-2">
          <input type="checkbox" checked={calibrated} onChange={(e) => setCalibrated(e.target.checked)} className="size-4 accent-[#007a4d]" />
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
          <legend className="text-sm font-medium text-ink-2">Result</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['Pass', 'Adjusted'] as const).map((r) => (
              <button key={r} type="button" aria-pressed={result === r} onClick={() => setResult(r)} className={choiceClass(result === r)}>
                {r === 'Pass' ? 'Pass (in tolerance)' : 'Adjusted to tolerance'}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Notes (optional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Reference standards used, readings, adjustments…" className={cn(fieldClass, 'py-2.5')} />
        </Field>
        {asset && <p className="text-xs text-ink-3">Next calibration will be scheduled in {asset.intervalMonths} months.</p>}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton type="submit"><Icon name="fi-rr-badge-check" /> Issue certificate</PrimaryButton>
        </div>
      </form>
    </PortalDialog>
  );
}

export type CatalogueOption = { slug: string; name: string; brand: string; image?: string };
const today = () => new Date().toISOString().slice(0, 10);
/** "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case). */
const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

/**
 * Register equipment a hospital already owns (bought before the website, or elsewhere), so it gets a calibration
 * schedule, service requests and certificates like everything bought through the shop.
 */
export function AddEquipmentDialog({ open, onOpenChange, facilities, products, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  facilities: string[];
  products: CatalogueOption[];
  onSubmit: (asset: Asset) => void;
}) {
  const blank = { facility: '', name: '', brand: '', serial: '', location: '', installed: '', lastCalibration: '', interval: '12', warranty: '' };
  const [v, setV] = useState(blank);
  useEffect(() => {
    if (open) setV(blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset each time it opens
  }, [open]);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  const match = products.find((p) => tidy(p.name).toLowerCase() === v.name.trim().toLowerCase());
  const ready = v.facility.trim().length > 1 && v.name.trim().length > 1;

  return (
    <PortalDialog open={open} onOpenChange={onOpenChange} title="Add existing equipment" description="Equipment a hospital already owns. It appears on that hospital’s dashboard with its calibration schedule.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          const installed = v.installed ? new Date(v.installed).toISOString() : new Date().toISOString();
          const last = v.lastCalibration ? new Date(v.lastCalibration).toISOString() : installed;
          const interval = Number(v.interval) || 12;
          const next = new Date(last);
          next.setMonth(next.getMonth() + interval);
          onSubmit({
            id: `AS-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
            name: match ? tidy(match.name) : v.name.trim(),
            brand: v.brand.trim() || match?.brand || '',
            productSlug: match?.slug,
            image: match?.image,
            serial: v.serial.trim() || 'Not recorded',
            facility: v.facility.trim(),
            location: v.location.trim() || 'Location not set',
            readings: [],
            installed,
            warrantyUntil: v.warranty ? new Date(v.warranty).toISOString() : installed,
            lastCalibration: last,
            nextCalibration: next.toISOString(),
            intervalMonths: interval,
            certificates: [],
          });
          onOpenChange(false);
        }}
        className="space-y-4"
      >
        <Field label="Hospital">
          <input required list="ff-facilities" value={v.facility} onChange={set('facility')} placeholder="Choose or type the hospital’s name" className={cn(fieldClass, 'h-11')} />
          <datalist id="ff-facilities">{facilities.map((f) => <option key={f} value={f} />)}</datalist>
        </Field>
        <Field label="Equipment">
          <input
            required
            list="ff-products"
            value={v.name}
            onChange={(e) => {
              const name = e.target.value;
              const p = products.find((x) => tidy(x.name).toLowerCase() === name.trim().toLowerCase());
              setV((x) => ({ ...x, name, brand: p ? p.brand : x.brand }));
            }}
            placeholder="Search the catalogue, or type a name"
            className={cn(fieldClass, 'h-11')}
          />
          <datalist id="ff-products">{products.map((p) => <option key={p.slug} value={tidy(p.name)}>{p.brand}</option>)}</datalist>
          {match && <span className="text-xs text-ok">From the catalogue: photo and documents are added.</span>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand"><input value={v.brand} onChange={set('brand')} placeholder="e.g. Mindray" className={cn(fieldClass, 'h-11')} /></Field>
          <Field label="Serial number"><input value={v.serial} onChange={set('serial')} placeholder="On the rating plate" className={cn(fieldClass, 'h-11')} /></Field>
        </div>
        <Field label="Department / location"><input value={v.location} onChange={set('location')} placeholder="e.g. Main laboratory" className={cn(fieldClass, 'h-11')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Installed on"><input type="date" max={today()} value={v.installed} onChange={set('installed')} className={cn(fieldClass, 'h-11')} /></Field>
          <Field label="Last calibration"><input type="date" max={today()} value={v.lastCalibration} onChange={set('lastCalibration')} className={cn(fieldClass, 'h-11')} /></Field>
          <Field label="Calibrate every">
            <select value={v.interval} onChange={set('interval')} className={cn(fieldClass, 'h-11')}>
              {[3, 6, 12, 24].map((m) => <option key={m} value={m}>{m} months</option>)}
            </select>
          </Field>
          <Field label="Warranty until (optional)"><input type="date" value={v.warranty} onChange={set('warranty')} className={cn(fieldClass, 'h-11')} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton type="button" onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={!ready}><Icon name="fi-rr-plus" /> Add equipment</PrimaryButton>
        </div>
      </form>
    </PortalDialog>
  );
}
