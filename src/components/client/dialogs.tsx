'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { inputClass, statusStyle, urgency } from '@/components/client/ui';
import { Icon, IconTile } from '@/components/ui/icon';
import { downloadCertificate } from '@/lib/service/certificate';
import { addMonths, assetStatus, clientSteps, newAssetId, dueLabel, daysUntil, fmtDate, fmtTime, type Asset, type Priority, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

function Shell({ open, onOpenChange, title, description, children, wide }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-midnight/40 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-[70] max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-paper p-6 text-ink shadow-2xl outline-none md:p-8',
            wide ? 'max-w-3xl' : 'max-w-lg',
          )}
        >
          <Dialog.Title className="text-2xl font-semibold tracking-[-0.02em]">{title}</Dialog.Title>
          {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          <Dialog.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-ink-3 hover:bg-mist hover:text-ink" aria-label="Close">
            <Icon name="fi-rr-cross-small" />
          </Dialog.Close>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const visits = ['As soon as possible', 'Today', 'Tomorrow', 'This week', 'Next scheduled visit'];

/** Submit a service request for one of the facility's systems. */
export function RequestDialog({ open, onOpenChange, assets, defaultAssetId, onSubmit }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assets: Asset[];
  defaultAssetId?: string;
  onSubmit: (v: { assetId: string; description: string; priority: Priority; contactPhone?: string; preferredVisit: string }) => void;
}) {
  const [assetId, setAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [phone, setPhone] = useState('');
  const [visit, setVisit] = useState(visits[0]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (open) {
      setAssetId(defaultAssetId ?? assets[0]?.id ?? '');
      setDescription('');
      setPriority('high');
      setVisit(visits[0]);
      setError('');
    }
  }, [open, defaultAssetId, assets]);

  return (
    <Shell open={open} onOpenChange={onOpenChange} title="Request service" description="Tell us what’s wrong. The nearest engineer is assigned and you can follow every step here.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (description.trim().length < 5) {
            setError('Describe the problem in a few words.');
            return;
          }
          onSubmit({ assetId, description: description.trim(), priority, contactPhone: phone.trim() || undefined, preferredVisit: visit });
          onOpenChange(false);
        }}
        className="space-y-5"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">System</span>
          <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={cn(inputClass, 'h-12')}>
            {assets.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.location}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">What’s happening?</span>
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Error E-21 on start-up, results out of range"
            aria-invalid={Boolean(error)}
            className={cn(inputClass, 'py-3')}
          />
          {error && <span role="alert" className="text-xs text-signal-700">{error}</span>}
        </label>
        <fieldset>
          <legend className="text-sm font-medium text-ink-2">How urgent is it?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(['critical', 'high', 'routine'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={priority === p}
                onClick={() => setPriority(p)}
                className={cn('rounded-2xl border p-3 text-left transition', priority === p ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20' : 'border-line hover:border-ink/25')}
              >
                <span className="block text-sm font-semibold text-ink">{urgency[p].label}</span>
                <span className="block text-xs text-ink-3">{urgency[p].hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Contact number (optional)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+233" className={cn(inputClass, 'h-12')} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Preferred visit</span>
            <select value={visit} onChange={(e) => setVisit(e.target.value)} className={cn(inputClass, 'h-12')}>
              {visits.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl px-4 py-3 text-sm text-ink-3 hover:text-ink">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700">
            <Icon name="fi-rr-paper-plane" /> Submit request
          </button>
        </div>
      </form>
    </Shell>
  );
}

/** One installed system: details, service history, certificates and actions. */
export function EquipmentSheet({ asset, tickets, onClose, onRequest, onOpenTicket }: {
  asset: Asset | null;
  tickets: Ticket[];
  onClose: () => void;
  onRequest: (assetId: string) => void;
  onOpenTicket: (id: string) => void;
}) {
  const history = asset ? tickets.filter((t) => t.assetId === asset.id).sort((a, b) => b.openedAt.localeCompare(a.openedAt)) : [];
  const st = asset ? assetStatus(asset, tickets) : 'online';
  const warrantyActive = asset ? daysUntil(asset.warrantyUntil) >= 0 : false;
  return (
    <Shell open={Boolean(asset)} onOpenChange={(v) => !v && onClose()} title={asset?.name ?? ''} description={asset ? `${asset.brand} · ${asset.location} · ${asset.serial}` : undefined} wide>
      {asset && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(90%_70%_at_50%_35%,#fff,#eef2ef)]">
              {asset.image ? <Image src={asset.image} alt="" fill sizes="180px" className="object-contain p-5 mix-blend-multiply" /> : <IconTile name="fi-rr-microscope" size="lg" />}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Status', st === 'online' ? 'Operational' : st === 'maintenance' ? 'Engineer on site' : 'Service in progress'],
                ['Installed', fmtDate(asset.installed)],
                ['Warranty', `${warrantyActive ? 'Until' : 'Ended'} ${fmtDate(asset.warrantyUntil)}`],
                ['Next calibration', `${fmtDate(asset.nextCalibration)} · ${dueLabel(asset.nextCalibration)}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-canvas p-3.5">
                  <dt className="text-xs text-ink-3">{k}</dt>
                  <dd className="mt-1 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => onRequest(asset.id)} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
              <Icon name="fi-rr-wrench-simple" /> Report a fault
            </button>
            {asset.productSlug && (
              <>
                <Link href={`/quote?product=${asset.productSlug}`} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/30">
                  <Icon name="fi-rr-shopping-cart" /> Order consumables
                </Link>
                <Link href={`/products/${asset.productSlug}`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-ink/30">
                  <Icon name="fi-rr-book-alt" /> Product & datasheet
                </Link>
              </>
            )}
          </div>

          <section>
            <h3 className="text-[1.125rem] font-semibold">Service history</h3>
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {history.map((t) => (
                <li key={t.id}>
                  <button onClick={() => onOpenTicket(t.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-canvas">
                    <span className="w-16 shrink-0 font-mono text-xs text-ink-3">{t.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{t.title}</span>
                      <span className="block text-xs text-ink-3">{fmtTime(t.openedAt)}</span>
                    </span>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs', statusStyle[t.status])}>{clientSteps[t.status]}</span>
                  </button>
                </li>
              ))}
              {history.length === 0 && <li className="px-4 py-5 text-sm text-ink-3">No service requests yet.</li>}
            </ul>
          </section>

          <section>
            <h3 className="text-[1.125rem] font-semibold">Calibration certificates</h3>
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {asset.certificates.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <Icon name="fi-rr-badge-check" className="text-brand-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{c.id} · {c.result}</span>
                    <span className="block text-xs text-ink-3">{fmtDate(c.date)} · {c.engineer}</span>
                  </span>
                  <button onClick={() => downloadCertificate(asset, c)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50" aria-label={`Download certificate ${c.id}`}>
                    <Icon name="fi-rr-download" /> Download
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Shell>
  );
}

export interface CatalogueItem { slug: string; name: string; brand: string; image?: string }
const OTHER = '__other';
const intervals = [3, 6, 12];

/** Register a system the facility owns, so its service, calibration and warranty can be followed here. */
export function AddEquipmentDialog({ open, onOpenChange, products, facility, onAdd }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  products: CatalogueItem[];
  facility: string;
  onAdd: (asset: Asset) => void;
}) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [serial, setSerial] = useState('');
  const [location, setLocation] = useState('');
  const [installed, setInstalled] = useState('');
  const [every, setEvery] = useState(6);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) {
      setSlug('');
      setName('');
      setBrand('');
      setSerial('');
      setLocation('');
      setInstalled(new Date().toISOString().slice(0, 10));
      setEvery(6);
      setErrors({});
    }
  }, [open]);
  const product = products.find((p) => p.slug === slug);
  // "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case)
  const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

  return (
    <Shell open={open} onOpenChange={onOpenChange} title="Add equipment" description="Register a system at your facility. You can then request service for it and keep its calibration certificates here.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const err: Record<string, string> = {};
          if (!slug) err.slug = 'Choose the system.';
          if (slug === OTHER && name.trim().length < 2) err.name = 'Enter the system name.';
          if (serial.trim().length < 2) err.serial = 'Enter the serial number on the label.';
          if (location.trim().length < 2) err.location = 'Where is it? e.g. Main laboratory';
          if (!installed) err.installed = 'Enter the installation date.';
          setErrors(err);
          if (Object.keys(err).length) return;
          const at = new Date(`${installed}T09:00:00`);
          // Next calibration: the first interval after today, counted from installation.
          let next = addMonths(at, every);
          while (next < new Date()) next = addMonths(next, every);
          onAdd({
            id: newAssetId(),
            name: product ? tidy(product.name) : name.trim(),
            brand: product ? product.brand : brand.trim() || 'Other',
            productSlug: product?.slug,
            image: product?.image,
            serial: serial.trim().toUpperCase(),
            facility,
            location: location.trim(),
            readings: [50, 52, 51, 53, 52, 54, 53, 55, 54, 56],
            installed: at.toISOString(),
            warrantyUntil: addMonths(at, 12).toISOString(),
            lastCalibration: addMonths(next, -every).toISOString(),
            nextCalibration: next.toISOString(),
            intervalMonths: every,
            certificates: [],
          });
          onOpenChange(false);
        }}
        className="space-y-5"
        noValidate
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">System</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} aria-invalid={Boolean(errors.slug)} className={cn(inputClass, 'h-12')}>
            <option value="">Choose from the Flokefama catalogue…</option>
            {products.map((p) => <option key={p.slug} value={p.slug}>{tidy(p.name)} · {p.brand}</option>)}
            <option value={OTHER}>Other (not in the list)</option>
          </select>
          {errors.slug && <span role="alert" className="text-xs text-signal-700">{errors.slug}</span>}
        </label>
        {slug === OTHER && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-ink-2">System name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} placeholder="e.g. Blood bank refrigerator" className={cn(inputClass, 'h-12')} />
              {errors.name && <span role="alert" className="text-xs text-signal-700">{errors.name}</span>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-ink-2">Brand</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Mindray" className={cn(inputClass, 'h-12')} />
            </label>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Serial number</span>
            <input value={serial} onChange={(e) => setSerial(e.target.value)} aria-invalid={Boolean(errors.serial)} placeholder="On the rating label" className={cn(inputClass, 'h-12')} />
            {errors.serial && <span role="alert" className="text-xs text-signal-700">{errors.serial}</span>}
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} aria-invalid={Boolean(errors.location)} placeholder="e.g. Main laboratory" className={cn(inputClass, 'h-12')} />
            {errors.location && <span role="alert" className="text-xs text-signal-700">{errors.location}</span>}
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Installed on</span>
            <input type="date" value={installed} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setInstalled(e.target.value)} aria-invalid={Boolean(errors.installed)} className={cn(inputClass, 'h-12')} />
            {errors.installed && <span role="alert" className="text-xs text-signal-700">{errors.installed}</span>}
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-ink-2">Calibrate every</span>
            <select value={every} onChange={(e) => setEvery(Number(e.target.value))} className={cn(inputClass, 'h-12')}>
              {intervals.map((m) => <option key={m} value={m}>{m} months</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white hover:bg-brand-700">
          <Icon name="fi-rr-plus" /> Add to my equipment
        </button>
      </form>
    </Shell>
  );
}
