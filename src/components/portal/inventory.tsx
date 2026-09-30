'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon, IconTile } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Asset } from '@/data/portal-demo';

const health = {
  online: { label: 'In spec', tone: 'green' as const },
  maintenance: { label: 'In service', tone: 'blue' as const },
  attention: { label: 'Needs attention', tone: 'red' as const },
};

/** Documentation view: every installed system; opening one shows its deep spec sheet. */
export function Inventory({ assets, onSelect }: { assets: Asset[]; onSelect: (a: Asset) => void }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((a) => (
          <li key={a.id}>
            <button onClick={() => onSelect(a)} className="group flex h-full w-full flex-col rounded-4xl border border-line bg-paper p-2 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]">
              <AssetVisual asset={a} className="aspect-[4/3] rounded-[1.6rem]" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="label">{a.brand}</p>
                  <Badge tone={health[a.status].tone}>{health[a.status].label}</Badge>
                </div>
                <p className="mt-2 font-semibold text-ink">{a.name}</p>
                <p className="text-sm text-ink-3">{a.location} · Next calibration {a.nextCalibration}</p>
              </div>
            </button>
          </li>
        ))}
    </ul>
  );
}

/** Deep spec sheet dialog for an installed system. */
export function AssetSheet({ asset: selected, onClose }: { asset: Asset | null; onClose: () => void }) {
  return (
      <Dialog.Root open={Boolean(selected)} onOpenChange={(v) => !v && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-midnight/50 backdrop-blur-sm data-[state=open]:animate-in" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-x-3 bottom-3 top-16 z-[70] mx-auto max-w-6xl overflow-hidden rounded-5xl bg-canvas shadow-2xl outline-none md:inset-x-6 md:bottom-6 md:top-24">
            {selected && <DeepSpecSheet asset={selected} />}
            <Dialog.Close className="glass-light absolute right-4 top-4 grid size-10 place-items-center rounded-full text-ink" aria-label="Close">
              <Icon name="fi-rr-cross-small" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
  );
}

function AssetVisual({ asset, className }: { asset: Asset; className?: string }) {
  const dark = asset.image?.includes('solution-ivd');
  return (
    <div className={`relative overflow-hidden ${dark ? 'bg-[#05090d]' : 'bg-[radial-gradient(90%_70%_at_50%_35%,#fff,#eef2ef)]'} ${className ?? ''}`}>
      {asset.image ? (
        <Image src={asset.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className={dark ? 'object-cover object-right' : 'object-contain p-[12%] mix-blend-multiply'} />
      ) : (
        <div className="grid h-full place-items-center"><IconTile name="fi-rr-microscope" size="lg" /></div>
      )}
    </div>
  );
}

/** Split view: asset summary on the left, tabbed technical records on the right. */
function DeepSpecSheet({ asset }: { asset: Asset }) {
  return (
    <div className="grid h-full overflow-y-auto lg:grid-cols-[0.9fr_1.1fr] lg:overflow-hidden">
      <div className="flex flex-col bg-paper lg:overflow-y-auto">
        <AssetVisual asset={asset} className="aspect-[4/3] w-full" />
        <div className="space-y-6 p-6 md:p-10">
          <div>
            <p className="label">{asset.brand} · {asset.id}</p>
            <Dialog.Title className="display mt-3 text-3xl md:text-4xl">{asset.name}</Dialog.Title>
            <div className="mt-3"><Badge tone={health[asset.status].tone}>{health[asset.status].label}</Badge></div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Serial', asset.serial],
              ['Location', asset.location],
              ['Installed', asset.installed],
              ['Warranty until', asset.warrantyUntil],
              ['Last calibration', asset.lastCalibration],
              ['Next calibration', asset.nextCalibration],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-canvas p-4">
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd className="mt-1 font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild><Link href="/quote">Book service visit</Link></Button>
            {asset.productSlug && <Button size="sm" variant="outline" asChild><Link href={`/products/${asset.productSlug}`}>Product page</Link></Button>}
          </div>
        </div>
      </div>

      <div className="min-w-0 p-6 md:p-10 lg:overflow-y-auto">
        <Tabs defaultValue="manual" className="gap-6">
          <TabsList aria-label="Technical records" className="self-start">
            <TabsTrigger value="manual"><Icon name="fi-rr-book-alt" /> Manual</TabsTrigger>
            <TabsTrigger value="schematic"><Icon name="fi-rr-settings" /> Schematics</TabsTrigger>
            <TabsTrigger value="calibration"><Icon name="fi-rr-chart-line-up" /> Calibration</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <div className="rounded-4xl border border-line bg-paper p-6">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">Operator manual (electronic)</p>
                <Badge tone="neutral">PDF · demo</Badge>
              </div>
              <div className="mt-6 space-y-3 rounded-3xl bg-canvas p-6" aria-hidden>
                <div className="h-3 w-1/3 rounded bg-line" />
                {[92, 80, 86, 70, 88, 60].map((w, i) => <div key={i} className="h-2 rounded bg-line/70" style={{ width: `${w}%` }} />)}
                <div className="mt-4 grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-video rounded-xl bg-line/60" />)}</div>
              </div>
              <p className="mt-4 text-xs text-ink-3">In production, manufacturer manuals uploaded to Sanity render here with an inline PDF viewer.</p>
            </div>
          </TabsContent>

          <TabsContent value="schematic">
            <div className="rounded-4xl border border-line bg-midnight p-6 text-white">
              <div className="flex items-center justify-between">
                <p className="font-medium">Power & signal overview</p>
                <Badge tone="dark">Illustrative</Badge>
              </div>
              <Schematic />
            </div>
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
                {asset.certificates.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <td className="px-4 py-4 font-medium text-ink">{c.id}<span className="block text-xs font-normal text-ink-3">{c.engineer}</span></td>
                    <td className="px-4 py-4 text-ink-2">{c.date}</td>
                    <td className="px-4 py-4"><Badge tone={c.result === 'Pass' ? 'green' : 'blue'}>{c.result}</Badge></td>
                    <td className="px-4 py-4 text-right"><Button size="sm" variant="ghost" disabled title="Demo data"><Icon name="fi-rr-download" /></Button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Schematic() {
  const boxes = [
    { x: 10, y: 20, label: 'Mains input' },
    { x: 130, y: 20, label: 'PSU' },
    { x: 250, y: 20, label: 'Main board' },
    { x: 250, y: 110, label: 'Photometer' },
    { x: 130, y: 110, label: 'Reagent cooler' },
    { x: 10, y: 110, label: 'Sample probe' },
  ];
  return (
    <svg viewBox="0 0 360 170" className="mt-6 w-full" role="img" aria-label="Illustrative block diagram of power and signal paths">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#8fd1a9" />
        </marker>
      </defs>
      {[[100, 40, 130, 40], [220, 40, 250, 40], [295, 60, 295, 110], [250, 130, 220, 130], [130, 130, 100, 130]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8fd1a9" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arr)" />
      ))}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width="90" height="40" rx="10" fill="rgb(255 255 255 / 0.05)" stroke="rgb(255 255 255 / 0.2)" />
          <text x={b.x + 45} y={b.y + 24} textAnchor="middle" fontSize="10" fill="white">{b.label}</text>
        </g>
      ))}
    </svg>
  );
}
