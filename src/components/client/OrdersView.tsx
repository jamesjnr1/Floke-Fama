'use client';

import Link from 'next/link';
import { Card } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { orderStatusLabel, type SavedOrder } from '@/lib/orders';
import { fmtDate } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const methodLabel = { momo: 'Mobile Money', card: 'Card', bank: 'Bank transfer' } as const;

/** Orders the facility placed at checkout, with what was ordered and where it is going. */
export function OrdersView({ orders }: { orders: SavedOrder[] }) {
  if (orders.length === 0)
    return (
      <Card className="grid place-items-center p-10 text-center">
        <span className="grid size-14 place-items-center rounded-lg bg-brand-50 text-2xl text-brand-700"><Icon name="fi-rr-box-open" /></span>
        <p className="mt-4 text-lg font-semibold text-ink">No orders yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-3">Equipment and consumables you check out on the Flokefama shop appear here, with their reference and delivery details.</p>
        <Link href="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
          <Icon name="fi-rr-shopping-cart" /> Shop equipment
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
              <span className={cn('rounded-md px-2.5 py-1 text-xs font-medium', o.status === 'awaiting-payment' ? 'bg-signal/10 text-signal-700' : 'bg-brand-50 text-brand-700')}>
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-ink-3">Deliver to <span className="text-ink">{o.address ? `${o.address}, ` : ''}{o.region}</span></p>
              {o.status === 'awaiting-payment' && (
                <a href={contact.phoneHref} className="inline-flex items-center gap-2 font-medium text-brand-700 hover:underline">
                  <Icon name="fi-rr-phone-call" /> Confirm payment with sales
                </a>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
