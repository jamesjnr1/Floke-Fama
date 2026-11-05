'use client';

import Link from 'next/link';
import { Card } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { orderStatusLabel, type SavedOrder } from '@/lib/orders';
import { fmtDate } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const methodLabel = { quote: 'Quote', momo: 'Mobile Money', card: 'Card', bank: 'Bank transfer' } as const;

/** The facility's quote requests (and older orders), with what was asked for, where it stands and where it is going. */
export function OrdersView({ orders }: { orders: SavedOrder[] }) {
  const { contact } = useSite();
  if (orders.length === 0)
    return (
      <Card className="grid place-items-center p-10 text-center">
        <span className="grid size-14 place-items-center rounded-lg bg-brand-50 text-2xl text-brand-700"><Icon name="fi-rr-box-open" /></span>
        <p className="mt-4 text-lg font-semibold text-ink">No quote requests yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-3">Quotes you request on the Flokefama shop appear here, with their reference, where they stand and the price once sales sends it.</p>
        <Link href="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
          <Icon name="fi-rr-shopping-cart" /> Browse equipment
        </Link>
      </Card>
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const units = o.items.reduce((n, x) => n + x.qty, 0);
        return (
          <Card key={o.reference} className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-ink-3">{o.reference} · {fmtDate(o.placedAt)}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{units} {units === 1 ? 'item' : 'items'} · {methodLabel[o.method]}</p>
              </div>
              <span className={cn('rounded-md px-2.5 py-1 text-xs font-medium', o.status === 'lost' ? 'bg-mist text-ink-3' : o.status === 'delivered' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700')}>
                {orderStatusLabel[o.status]}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {o.items.map((x) => (
                <li key={x.slug} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <Link href={`/products/${x.slug}`} className="min-w-0 truncate text-ink hover:text-brand-700">{x.name}</Link>
                  <span className="shrink-0 tabular-nums text-ink-3">× {x.qty}</span>
                </li>
              ))}
            </ul>
            {o.amount !== undefined && (
              <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm">
                <p className="font-semibold text-ink">{o.method === 'quote' ? 'Quoted price' : 'Price agreed'}: GHS {o.amount.toLocaleString('en-GB')}</p>
                <p className="mt-0.5 text-ink-2">
                  {o.status === 'priced'
                    ? o.method === 'quote'
                      ? 'Next: accept the quote and pay as our sales team explained. Once it is paid, we prepare and deliver it.'
                      : `Next: pay by ${methodLabel[o.method].toLowerCase()} as our sales team explained. Once it is paid, we prepare and deliver your order.`
                    : o.status === 'paid'
                      ? 'Paid, thank you. We are preparing your order.'
                      : o.status === 'processing'
                        ? 'Being prepared for delivery.'
                        : 'Delivered.'}
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-ink-3">Deliver to <span className="text-ink">{o.address ? `${o.address}, ` : ''}{o.region}</span></p>
              {(o.status === 'awaiting-payment' || o.status === 'called' || o.status === 'priced') && (
                <a href={contact.phoneHref} className="inline-flex items-center gap-2 font-medium text-brand-700 hover:underline">
                  <Icon name="fi-rr-phone-call" /> Questions? Call sales
                </a>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
