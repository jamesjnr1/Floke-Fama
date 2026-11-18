'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { markReceived, type SavedOrder } from '@/lib/orders';
import { fmtDate } from '@/lib/service/store';

/**
 * The facility's quote requests: what was asked for and when. No stages: our team replies by phone and email. When the
 * equipment has arrived (delivered and installed), "We've received it" puts it on the facility's equipment list.
 */
export function OrdersView({ orders }: { orders: SavedOrder[] }) {
  const { contact } = useSite();
  if (orders.length === 0)
    return (
      <Card className="grid place-items-center p-10 text-center">
        <span className="grid size-14 place-items-center rounded-lg bg-brand-50 text-2xl text-brand-700"><Icon name="fi-rr-box-open" /></span>
        <p className="mt-4 text-lg font-semibold text-ink">No quote requests yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-3">Quotes you request on the Flokefama shop appear here, with their reference and what you asked for.</p>
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
            <p className="font-mono text-xs text-ink-3">{o.reference} · {fmtDate(o.placedAt)}</p>
            <p className="mt-1 text-lg font-semibold text-ink">Quote request · {units} {units === 1 ? 'item' : 'items'}</p>
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
              <a href={contact.phoneHref} className="inline-flex items-center gap-2 font-medium text-brand-700 hover:underline">
                <Icon name="fi-rr-phone-call" /> Questions? Call us
              </a>
            </div>
            {o.method === 'quote' && <Received order={o} />}
          </Card>
        );
      })}
    </div>
  );
}

/** "We've received it": the request's equipment goes on the facility's list. Shows that it's there once done. */
function Received({ order }: { order: SavedOrder }) {
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: { added?: number } }>({});
  if (order.equipmentAdded || state.done)
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-50 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-medium text-brand-800">
          <Icon name="fi-rr-check-circle" /> Received and installed. On your equipment list.
        </p>
        <a href="/portal?view=equipment" className="font-semibold text-brand-700 hover:underline">See my equipment</a>
      </div>
    );
  const receive = async () => {
    setState({ busy: true });
    const r = await markReceived(order.reference);
    setState(r.ok ? { done: { added: r.added } } : { error: r.error });
  };
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3 text-sm">
      <p className="text-ink-2">Received and installed? Tap the button and it goes on your equipment list, so we can look after it.</p>
      <button type="button" onClick={receive} disabled={state.busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        <Icon name="fi-rr-box-open" /> {state.busy ? 'Adding…' : 'We’ve received it'}
      </button>
      {state.error && <p role="alert" className="w-full text-signal-700">{state.error}</p>}
    </div>
  );
}
