'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { statusMeta } from '@/components/service/status';
import { GhostButton, PrimaryButton, tag } from '@/components/service/ui';
import { Icon, IconTile } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { downloadCertificate } from '@/lib/service/certificate';
import { assetImage, assetStatus, dueLabel, fmtDate, fmtTime, isOpen, type Asset, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Documents: every system; opening one shows its records, certificates and manuals. */
export function Inventory({ assets, tickets, onSelect, onAdd }: { assets: Asset[]; tickets: Ticket[]; onSelect: (a: Asset) => void; onAdd: () => void }) {
  if (assets.length === 0)
    return <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-3">No equipment yet. Service records, certificates and manuals for each system appear here. <button onClick={onAdd} className="font-medium text-brand-700 hover:underline">Add existing equipment</button></p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {assets.map((a) => {
        const h = statusMeta[assetStatus(a, tickets)];
        return (
          <li key={a.id} className="min-w-0">
            <button onClick={() => onSelect(a)} className="flex h-full w-full flex-col rounded-xl border border-line bg-paper p-2 text-left transition hover:border-ink/20">
              <AssetVisual asset={a} className="aspect-[16/9] rounded-md" />
              <div className="p-3">
                <p className="text-xs text-ink-3">{a.brand} · {a.facility}</p>
                <p className="mt-0.5 font-semibold text-ink">{a.name}</p>
                <p className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-ink-3">{a.certificates.length} certificate{a.certificates.length === 1 ? '' : 's'}</span>
                  <span className={cn('font-medium', h.text)}>{h.label}</span>
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** System sheet: summary and actions on the left, records on the right. */
export function AssetSheet({ asset, tickets, onClose, onLogFault, onRecord, onOpenTicket }: {
  asset: Asset | null;
  tickets: Ticket[];
  onClose: () => void;
  onLogFault: (assetId: string) => void;
  onRecord: (a: Asset) => void;
  onOpenTicket: (id: string) => void;
}) {
  return (
    <Dialog.Root open={Boolean(asset)} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content aria-describedby={undefined} className="fixed inset-x-3 bottom-3 top-16 z-[70] mx-auto max-w-6xl overflow-hidden rounded-xl border border-line bg-canvas text-ink shadow-2xl outline-none md:inset-x-6 md:bottom-6 md:top-24">
          {asset && <Sheet asset={asset} tickets={tickets} onLogFault={onLogFault} onRecord={onRecord} onOpenTicket={onOpenTicket} />}
          <Dialog.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-md border border-line bg-paper text-ink hover:border-ink/30" aria-label="Close">
            <Icon name="fi-rr-cross-small" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AssetVisual({ asset, className }: { asset: Asset; className?: string }) {
  const img = assetImage(asset);
  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-white', className)}>
      {img ? <Image src={img} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-[8%]" /> : <IconTile name="fi-rr-microscope" />}
    </div>
  );
}

const tabs = [
  { id: 'history', label: 'Service history' },
  { id: 'calibration', label: 'Certificates' },
  { id: 'docs', label: 'Documents' },
] as const;

function Sheet({ asset, tickets, onLogFault, onRecord, onOpenTicket }: {
  asset: Asset;
  tickets: Ticket[];
  onLogFault: (assetId: string) => void;
  onRecord: (a: Asset) => void;
  onOpenTicket: (id: string) => void;
}) {
  const { contact } = useSite();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('history');
  const h = statusMeta[assetStatus(asset, tickets)];
  const history = tickets.filter((t) => t.assetId === asset.id).sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  const manualRequest = `mailto:${contact.support}?subject=${encodeURIComponent(`Manual request: ${asset.brand} ${asset.name} (${asset.serial})`)}&body=${encodeURIComponent(`Please send the operator and service manuals for:\n\n${asset.brand} ${asset.name}\nSerial: ${asset.serial}\nFacility: ${asset.facility}, ${asset.location}\n`)}`;

  return (
    <div className="grid h-full overflow-y-auto lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
      <div className="flex flex-col border-line bg-paper lg:overflow-y-auto lg:border-r">
        <AssetVisual asset={asset} className="aspect-[16/10] w-full" />
        <div className="space-y-6 p-6 md:p-8">
          <div>
            <p className="text-xs text-ink-3">{asset.brand} · {asset.id}</p>
            <Dialog.Title className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink md:text-3xl">{asset.name}</Dialog.Title>
            <p className={cn('mt-2 flex items-center gap-2 text-sm font-medium', h.text)}><span className={cn('size-2 rounded-[1px]', h.dot)} aria-hidden /> {h.label}</p>
          </div>
          <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-line text-sm">
            {[
              ['Serial', asset.serial],
              ['Facility', `${asset.facility}, ${asset.location}`],
              ['Installed', asset.installation ? 'Awaiting installation' : fmtDate(asset.installed)],
              ['Warranty until', asset.installation ? 'Starts at install' : fmtDate(asset.warrantyUntil)],
              ['Last calibration', asset.installation ? '—' : fmtDate(asset.lastCalibration)],
              ['Next calibration', asset.installation ? 'After install' : `${fmtDate(asset.nextCalibration)} · ${dueLabel(asset.nextCalibration)}`],
            ].map(([k, v], i) => (
              <div key={k} className={cn('p-4', i % 2 === 1 && 'border-l border-line', i >= 2 && 'border-t border-line')}>
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd className="mt-1 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={() => onLogFault(asset.id)}><Icon name="fi-rr-plus" /> Log fault</PrimaryButton>
            <GhostButton onClick={() => onRecord(asset)}><Icon name="fi-rr-badge-check" /> Record calibration</GhostButton>
          </div>
        </div>
      </div>

      <div className="min-w-0 p-6 md:p-8 lg:overflow-y-auto">
        <div className="flex gap-5 overflow-x-auto border-b border-line pr-12" role="tablist" aria-label="System records">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn('-mb-px shrink-0 border-b-2 py-2.5 text-sm', tab === t.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5" role="tabpanel">
          {tab === 'history' && (
            <ul className="overflow-hidden rounded-lg border border-line bg-paper">
              {history.map((t, i) => (
                <li key={t.id} className={cn(i > 0 && 'border-t border-line')}>
                  <button onClick={() => onOpenTicket(t.id)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-canvas">
                    <span className="font-mono text-xs text-ink-3">{t.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{t.title}</span>
                      <span className="block truncate text-xs text-ink-3">{fmtTime(t.openedAt)}{t.resolution ? ` · ${t.resolution}` : ''}</span>
                    </span>
                    <span className={cn(tag, isOpen(t) ? 'bg-warn/12 text-warn' : 'bg-ok/12 text-ok')}>{isOpen(t) ? 'Open' : 'Resolved'}</span>
                  </button>
                </li>
              ))}
              {history.length === 0 && <li className="p-6 text-sm text-ink-3">No service requests for this system yet.</li>}
            </ul>
          )}

          {tab === 'calibration' && (
            <div className="overflow-hidden rounded-lg border border-line bg-paper">
              <table className="w-full text-sm">
                <caption className="sr-only">Certificate history</caption>
                <thead>
                  <tr className="border-b border-line bg-canvas text-left">
                    {['Certificate', 'Date', 'Result', ''].map((x) => <th key={x} scope="col" className="px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{x}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {asset.certificates.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-4 font-medium text-ink">{c.id}<span className="block text-xs font-normal text-ink-3">{c.engineer}{c.notes ? ` · ${c.notes}` : ''}</span></td>
                      <td className="px-4 py-4 text-ink-2">{fmtDate(c.date)}</td>
                      <td className="px-4 py-4"><span className={cn(tag, c.result === 'Pass' ? 'bg-ok/12 text-ok' : 'bg-warn/12 text-warn')}>{c.result}</span></td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => downloadCertificate(asset, c)} aria-label={`Download certificate ${c.id}`} className="grid size-9 place-items-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink"><Icon name="fi-rr-download" /></button>
                      </td>
                    </tr>
                  ))}
                  {asset.certificates.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-ink-3">No certificates yet. They are issued at installation and after each calibration.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'docs' && (
            <ul className="overflow-hidden rounded-lg border border-line bg-paper">
              <li className="flex flex-wrap items-center justify-between gap-3 p-5">
                <span>
                  <span className="block font-medium text-ink">Operator & service manuals</span>
                  <span className="text-sm text-ink-3">Requested from Flokefama support for this serial number.</span>
                </span>
                <a href={manualRequest} className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-ink/30"><Icon name="fi-rr-envelope" /> Request</a>
              </li>
              {asset.productSlug && (
                <li className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-5">
                  <span>
                    <span className="block font-medium text-ink">Product page & datasheet</span>
                    <span className="text-sm text-ink-3">Specifications, compatibility and documents.</span>
                  </span>
                  <Link href={`/products/${asset.productSlug}`} target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-ink/30">Open</Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
