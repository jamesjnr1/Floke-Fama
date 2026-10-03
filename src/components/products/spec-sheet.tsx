'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToQuote } from '@/components/sales/add-to-quote';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { brochureUrl } from '@/data/seed';
import type { Product } from '@/lib/types';

const statusTone = { validated: 'green', supported: 'blue', consult: 'amber' } as const;
const statusLabel = { validated: 'Validated', supported: 'Supported', consult: 'Consult us' };

/** Tabbed detail: key features (from the Flokefama brochure), product details, compatibility and documents. */
export function SpecTabs({ product, categoryTitle }: { product: Product; categoryTitle?: string }) {
  const features = product.highlights.length > 0;
  return (
    <Tabs defaultValue={features ? 'features' : 'details'} className="gap-6">
      <TabsList aria-label="Product information" className="self-start">
        {features && <TabsTrigger value="features">Key features</TabsTrigger>}
        <TabsTrigger value="details">Details</TabsTrigger>
        {product.compatibility?.length ? <TabsTrigger value="compat">Compatibility</TabsTrigger> : null}
        <TabsTrigger value="docs">Documents</TabsTrigger>
      </TabsList>

      {features && (
        <TabsContent value="features">
          <ul className="divide-y divide-line rounded-3xl border border-line bg-paper">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 px-5 py-3.5 text-sm text-ink">
                <Icon name="fi-rr-check" className="mt-0.5 shrink-0 text-brand-600" /> {h}
              </li>
            ))}
          </ul>
          {product.highlightsSource === 'brochure' && (
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-3">
              <Icon name="fi-rr-info" /> From the Flokefama brochure.
            </p>
          )}
        </TabsContent>
      )}

      <TabsContent value="details">
        <dl className="divide-y divide-line rounded-3xl border border-line bg-paper">
          {[
            { label: 'Brand', value: product.brand },
            ...(categoryTitle ? [{ label: 'Category', value: categoryTitle }] : []),
            ...(product.types?.length ? [{ label: 'Listed under', value: product.types.join(', ') }] : []),
            ...product.specs,
          ].map((s) => (
            <div key={s.label} className="grid grid-cols-[1fr_1.4fr] gap-6 px-5 py-4 text-sm">
              <dt className="text-ink-3">{s.label}</dt>
              <dd className="font-medium text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-3">
          <Icon name="fi-rr-info" /> Full specifications on request: our applications team will send the manufacturer datasheet.
        </p>
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
          <DocRow title="Flokefama company brochure" kind="brochure" href={brochureUrl} />
          {(product.documents.length ? product.documents : [{ title: `${product.name} datasheet`, kind: 'datasheet' as const }]).map((d) => (
            <DocRow key={d.title} title={d.title} kind={d.kind} href={d.url} requestHref={`/quote?product=${product.slug}&docs=1`} />
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}

function DocRow({ title, kind, href, requestHref }: { title: string; kind: string; href?: string; requestHref?: string }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4">
      <span className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-signal/10 text-signal-700"><Icon name="fi-rr-file-pdf" /></span>
        <span>
          <span className="block text-sm font-medium text-ink">{title}</span>
          <span className="text-xs capitalize text-ink-3">{kind} · PDF</span>
        </span>
      </span>
      {href ? (
        <Button asChild size="sm" variant="outline">
          <a href={href} download><Icon name="fi-rr-download" /> Download</a>
        </Button>
      ) : requestHref ? (
        <Button asChild size="sm" variant="ghost">
          <Link href={requestHref}>Request</Link>
        </Button>
      ) : null}
    </li>
  );
}

export function SpecHeader({ product, categoryTitle }: { product: Product; categoryTitle?: string }) {
  const description = product.description?.length ? product.description : [product.summary];
  return (
    <div>
      <p className="label">{product.brand}{categoryTitle ? ` · ${categoryTitle}` : ''}</p>
      <h1 className="display mt-3 text-4xl md:text-5xl">{product.name}</h1>
      {description.map((d) => (
        <p key={d} className="mt-4 max-w-lg leading-relaxed text-ink-3">{d}</p>
      ))}
      {product.types?.length ? (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Listed under">
          {product.types.map((t) => (
            <li key={t}><Badge tone="green">{t}</Badge></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function SpecActions({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href={`/quote?product=${product.slug}`}>Request a quote</Link>
      </Button>
      <AddToQuote item={{ slug: product.slug, name: product.name, brand: product.brand, image: product.image }} />
      <Link href={`/quote?intent=demo&product=${product.slug}`} className="inline-flex h-12 items-center px-2 text-sm font-medium text-brand-700 underline-offset-4 hover:underline">
        Schedule a demonstration
      </Link>
    </div>
  );
}
