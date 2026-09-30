'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@/lib/types';

const statusTone = { validated: 'green', supported: 'blue', consult: 'amber' } as const;
const statusLabel = { validated: 'Validated', supported: 'Supported', consult: 'Consult us' };

/** Tabbed technical detail: specifications, compatibility matrix and documents. */
export function SpecTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="specs" className="gap-6">
      <TabsList aria-label="Product information" className="self-start">
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        {product.compatibility?.length ? <TabsTrigger value="compat">Compatibility</TabsTrigger> : null}
        <TabsTrigger value="docs">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="specs">
        <dl className="divide-y divide-line rounded-3xl border border-line bg-paper">
          {product.specs.map((s) => (
            <div key={s.label} className="grid grid-cols-[1fr_1.4fr] gap-6 px-5 py-4 text-sm">
              <dt className="text-ink-3">{s.label}</dt>
              <dd className="font-medium text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
        {!product.specsVerified && (
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-3">
            <Icon name="fi-rr-info" /> Indicative specifications. Our applications team will confirm against the manufacturer datasheet.
          </p>
        )}
      </TabsContent>

      {product.compatibility?.length ? (
        <TabsContent value="compat">
          <table className="w-full overflow-hidden rounded-3xl border border-line bg-paper text-sm">
            <caption className="sr-only">Reagent and consumable compatibility</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="label px-5 py-3 font-medium">Item</th>
                <th scope="col" className="label px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {product.compatibility.map((c) => (
                <tr key={c.item}>
                  <td className="px-5 py-4 text-ink">
                    {c.item}
                    {c.note && <span className="block text-xs text-ink-3">{c.note}</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      ) : null}

      <TabsContent value="docs">
        <ul className="space-y-2">
          {(product.documents.length ? product.documents : [{ title: `${product.name} datasheet`, kind: 'datasheet' as const }]).map((d) => (
            <li key={d.title} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-signal/10 text-signal-700"><Icon name="fi-rr-file-pdf" /></span>
                <span>
                  <span className="block text-sm font-medium text-ink">{d.title}</span>
                  <span className="text-xs capitalize text-ink-3">{d.kind} · PDF</span>
                </span>
              </span>
              {d.url ? (
                <Button asChild size="sm" variant="outline">
                  <a href={d.url} download><Icon name="fi-rr-download" /> Download</a>
                </Button>
              ) : (
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/quote?product=${product.slug}&docs=1`}>Request</Link>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}

export function SpecHeader({ product, categoryTitle }: { product: Product; categoryTitle?: string }) {
  return (
    <div>
      <p className="label">{product.brand}{categoryTitle ? ` · ${categoryTitle}` : ''}</p>
      <h1 className="display mt-3 text-4xl md:text-5xl">{product.name}</h1>
      <p className="mt-4 max-w-lg font-light leading-relaxed text-ink-3">{product.summary}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {product.highlights.map((h) => (
          <li key={h}><Badge tone="green"><Icon name="fi-rr-check" /> {h}</Badge></li>
        ))}
      </ul>
    </div>
  );
}

export function SpecActions({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href={`/quote?product=${product.slug}`}>Request a quote <Icon name="fi-rr-arrow-small-right" /></Link>
      </Button>
      <Button asChild variant="outline">
        <Link href={`/quote?intent=demo&product=${product.slug}`}>Schedule a demonstration</Link>
      </Button>
    </div>
  );
}
