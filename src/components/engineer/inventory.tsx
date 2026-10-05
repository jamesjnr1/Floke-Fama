'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon, IconTile } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contact } from '@/data/seed';
import { downloadCertificate } from '@/lib/service/certificate';
import { assetStatus, dueLabel, fmtDate, fmtTime, isOpen, type Asset, type Ticket } from '@/lib/service/store';

const health = {
  online: { label: 'Online', tone: 'green' as const },
  maintenance: { label: 'In service', tone: 'neutral' as const },
  attention: { label: 'Needs attention', tone: 'red' as const },
  installing: { label: 'To install', tone: 'neutral' as const },
};

/** Documentation view: every installed system; opening one shows its records. */
export function Inventory({ assets, tickets, onSelect }: { assets: Asset[]; tickets: Ticket[]; onSelect: (a: Asset) => void }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {assets.map((a) => {
        const h = health[assetStatus(a, tickets)];
        return (
          <li key={a.id}>
            <button onClick={() => onSelect(a)} className="group flex h-full w-full flex-col rounded-4xl border border-line bg-paper p-2 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]">
              <AssetVisual asset={a} className="aspect-[4/3] rounded-[1.6rem]" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="label">{a.brand}</p>
                  <Badge tone={h.tone}>{h.label}</Badge>
                </div>
                <p className="mt-2 font-semibold text-ink">{a.name}</p>
                <p className="text-sm text-ink-3">{a.facility} · {a.certificates.length} certificate{a.certificates.length === 1 ? '' : 's'}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** System sheet: summary + actions on the left, tabbed records on the right. */
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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-midnight/50 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed inset-x-3 bottom-3 top-16 z-[70] mx-auto max-w-6xl overflow-hidden rounded-5xl bg-canvas shadow-2xl outline-none md:inset-x-6 md:bottom-6 md:top-24">
          {asset && <Sheet asset={asset} tickets={tickets} onLogFault={onLogFault} onRecord={onRecord} onOpenTicket={onOpenTicket} />}
          <Dialog.Close className="glass-light absolute right-4 top-4 grid size-10 place-items-center rounded-full text-ink" aria-label="Close">
            <Icon name="fi-rr-cross-small" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AssetVisual({ asset, className }: { asset: Asset; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(90%_70%_at_50%_35%,#fff,#eef2ef)] ${className ?? ''}`}>
      {asset.image ? (
        <Image src={asset.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain p-[12%] mix-blend-multiply" />
      ) : (
        <div className="grid h-full place-items-center"><IconTile name="fi-rr-microscope" size="lg" /></div>
      )}
    </div>
  );
}

function Sheet({ asset, tickets, onLogFault, onRecord, onOpenTicket }: {
  asset: Asset;
  tickets: Ticket[];
  onLogFault: (assetId: string) => void;
  onRecord: (a: Asset) => void;
  onOpenTicket: (id: string) => void;
}) {
  const h = health[assetStatus(asset, tickets)];
  const history = tickets.filter((t) => t.assetId === asset.id).sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  const manualRequest = `mailto:${contact.support}?subject=${encodeURIComponent(`Manual request: ${asset.brand} ${asset.name} (${asset.serial})`)}&body=${encodeURIComponent(`Please send the operator and service manuals for:\n\n${asset.brand} ${asset.name}\nSerial: ${asset.serial}\nFacility: ${asset.facility}, ${asset.location}\n`)}`;

  return (
    <div className="grid h-full overflow-y-auto lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
      <div className="flex flex-col bg-paper lg:overflow-y-auto">
        <AssetVisual asset={asset} className="aspect-[16/10] w-full" />
        <div className="space-y-6 p-6 md:p-10">
          <div>
            <p className="label">{asset.brand} · {asset.id}</p>
            <Dialog.Title className="display mt-3 text-3xl md:text-4xl">{asset.name}</Dialog.Title>
            <div className="mt-3"><Badge tone={h.tone}>{h.label}</Badge></div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Serial', asset.serial],
              ['Facility', `${asset.facility}, ${asset.location}`],
              ['Installed', fmtDate(asset.installed)],
              ['Warranty until', fmtDate(asset.warrantyUntil)],
              ['Last calibration', fmtDate(asset.lastCalibration)],
              ['Next calibration', `${fmtDate(asset.nextCalibration)} · ${dueLabel(asset.nextCalibration)}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-canvas p-4">
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd className="mt-1 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onLogFault(asset.id)}><Icon name="fi-rr-plus" /> Log fault</Button>
            <Button size="sm" variant="outline" onClick={() => onRecord(asset)}><Icon name="fi-rr-badge-check" /> Record calibration</Button>
          </div>
        </div>
      </div>

      <div className="min-w-0 p-6 md:p-10 lg:overflow-y-auto">
        <Tabs defaultValue="history" className="gap-6">
          <TabsList aria-label="System records" className="self-start">
            <TabsTrigger value="history"><Icon name="fi-rr-time-fast" /> Service history</TabsTrigger>
            <TabsTrigger value="calibration"><Icon name="fi-rr-chart-line-up" /> Calibration</TabsTrigger>
            <TabsTrigger value="docs"><Icon name="fi-rr-book-alt" /> Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <ul className="space-y-2">
              {history.map((t) => (
                <li key={t.id}>
                  <button onClick={() => onOpenTicket(t.id)} className="flex w-full items-center gap-4 rounded-3xl border border-line bg-paper p-4 text-left transition hover:border-ink/20">
                    <span className="font-mono text-xs text-ink-3">{t.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{t.title}</span>
                      <span className="block truncate text-xs text-ink-3">{fmtTime(t.openedAt)}{t.resolution ? ` · ${t.resolution}` : ''}</span>
                    </span>
                    <Badge tone={isOpen(t) ? 'amber' : 'green'}>{isOpen(t) ? 'Open' : 'Resolved'}</Badge>
                  </button>
                </li>
              ))}
              {history.length === 0 && <li className="rounded-3xl border border-dashed border-line p-6 text-sm text-ink-3">No service tickets for this system yet.</li>}
            </ul>
          </TabsContent>

          <TabsContent value="calibration">
            <table className="w-full overflow-hidden rounded-3xl border border-line bg-paper text-sm">
              <caption className="sr-only">Calibration certificate history</caption>
              <thead>
                <tr className="border-b border-line text-left">
                  {['Certificate', 'Date', 'Result', ''].map((h) => <th key={h} scope="col" className="label px-4 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {asset.certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-4 font-medium text-ink">{c.id}<span className="block text-xs font-normal text-ink-3">{c.engineer}{c.notes ? ` · ${c.notes}` : ''}</span></td>
                    <td className="px-4 py-4 text-ink-2">{fmtDate(c.date)}</td>
                    <td className="px-4 py-4"><Badge tone={c.result === 'Pass' ? 'green' : 'amber'}>{c.result}</Badge></td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => downloadCertificate(asset, c)} aria-label={`Download certificate ${c.id}`}><Icon name="fi-rr-download" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="docs">
            <ul className="space-y-2">
              <li className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-paper p-5">
                <span>
                  <span className="block font-medium text-ink">Operator & service manuals</span>
                  <span className="text-sm text-ink-3">Requested from Flokefama support for this serial number.</span>
                </span>
                <Button size="sm" variant="outline" asChild><a href={manualRequest}><Icon name="fi-rr-envelope" /> Request</a></Button>
              </li>
              {asset.productSlug && (
                <li className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-paper p-5">
                  <span>
                    <span className="block font-medium text-ink">Product page & datasheet</span>
                    <span className="text-sm text-ink-3">Specifications, compatibility and documents.</span>
                  </span>
                  <Button size="sm" variant="outline" asChild><Link href={`/products/${asset.productSlug}`} target="_blank"> Open</Link></Button>
                </li>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
