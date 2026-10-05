'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { CreditCard, Landmark, Lock, Minus, Plus, ShieldCheck, Smartphone, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { contact } from '@/data/seed';
import { track } from '@/lib/analytics';
import { useSession } from '@/lib/auth/use-session';
import { saveOrder } from '@/lib/orders';
import { orderReference, startPayment, type CheckoutOrder, type PaymentMethod } from '@/lib/payments';
import { quoteHref, quoteList, useQuoteList } from '@/lib/quote-list';
import { cn } from '@/lib/utils';

const regions = ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Volta', 'Northern', 'Bono', 'Bono East', 'Upper East', 'Upper West', 'Other'];
const networks = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'];

const field = 'h-12 w-full rounded-xl border border-line bg-paper px-4 text-base text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

const methods: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: 'momo', label: 'Mobile Money', hint: 'MTN, Telecel, AirtelTigo', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Visa or Mastercard', icon: CreditCard },
  { id: 'bank', label: 'Bank transfer', hint: 'For hospitals and institutions', icon: Landmark },
];

/** Checkout: the cart goes straight here. Contact and delivery, a payment method, then Pay securely. */
export function Checkout() {
  const items = useQuoteList();
  const { user } = useSession();
  const [method, setMethod] = useState<PaymentMethod>('momo');
  const [network, setNetwork] = useState(networks[0]);
  const [paying, setPaying] = useState<CheckoutOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const units = items.reduce((n, x) => n + (x.qty ?? 1), 0);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '').trim();
    const order: CheckoutOrder = {
      reference: orderReference(),
      items: items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty ?? 1 })),
      customer: { name: get('name'), organisation: get('organisation'), phone: get('phone'), email: get('email'), region: get('region'), address: get('address') },
      method,
      momo: method === 'momo' ? { network, number: get('momo') } : undefined,
    };
    setBusy(true);
    track('checkout_pay', { items: units, method });
    const result = await startPayment(order);
    setBusy(false);
    if (user) saveOrder(order, user.email);
    if (result.status === 'redirect') window.location.href = result.url;
    else setPaying(order);
  };

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-paper p-10 text-center">
        <p className="text-2xl font-bold text-ink">Your cart is empty</p>
        <p className="mt-2 text-ink-3">Add equipment from the shop with the + button, then come back here to pay.</p>
        <Link href="/products" className="mt-6 inline-flex h-12 items-center bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">Browse the catalogue</Link>
      </div>
    );

  return (
    <>
      <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          {/* 1. Contact & delivery */}
          <section className="rounded-3xl border border-line bg-paper p-6 md:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-ink">
              <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm text-white">1</span> Contact &amp; delivery
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Full name</span><input key={`name-${user ? 1 : 0}`} name="name" defaultValue={user?.name} required autoComplete="name" className={field} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Hospital / organisation</span><input key={`organisation-${user ? 1 : 0}`} name="organisation" defaultValue={user?.facility} required autoComplete="organization" className={field} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Phone</span><input key={`phone-${user ? 1 : 0}`} name="phone" defaultValue={user?.phone} required type="tel" autoComplete="tel" placeholder="+233" className={field} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Email</span><input key={`email-${user ? 1 : 0}`} name="email" defaultValue={user?.email} required type="email" autoComplete="email" className={field} /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Region</span>
                <select name="region" required defaultValue="Greater Accra" className={field}>{regions.map((r) => <option key={r}>{r}</option>)}</select>
              </label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Delivery address</span><input name="address" required autoComplete="street-address" placeholder="Town, street, landmark" className={field} /></label>
            </div>
          </section>

          {/* 2. Payment */}
          <section className="rounded-3xl border border-line bg-paper p-6 md:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-ink">
              <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm text-white">2</span> Payment method
            </h2>
            <div role="radiogroup" aria-label="Payment method" className="mt-6 grid gap-3 sm:grid-cols-3">
              {methods.map((m) => {
                const on = method === m.id;
                const Ico = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setMethod(m.id)}
                    className={cn('flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition', on ? 'border-brand-600 bg-brand-50' : 'border-line bg-paper hover:border-ink/25')}
                  >
                    <Ico className={cn('size-6', on ? 'text-brand-600' : 'text-ink-3')} aria-hidden />
                    <span className="font-semibold text-ink">{m.label}</span>
                    <span className="text-sm text-ink-3">{m.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              {method === 'momo' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Network</span>
                    <select value={network} onChange={(e) => setNetwork(e.target.value)} className={field}>{networks.map((n) => <option key={n}>{n}</option>)}</select>
                  </label>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-ink-2">Mobile Money number</span><input name="momo" required type="tel" placeholder="024 000 0000" className={field} /></label>
                  <p className="text-sm text-ink-3 sm:col-span-2">You’ll get a prompt on your phone to approve the payment.</p>
                </div>
              )}
              {method === 'card' && (
                <p className="rounded-2xl bg-canvas p-4 text-ink-2">
                  You’ll enter your card details on our payment partner’s secure page. Flokefama never sees or stores your card number.
                </p>
              )}
              {method === 'bank' && (
                <p className="rounded-2xl bg-canvas p-4 text-ink-2">
                  We’ll send an invoice with Flokefama’s bank details and your order reference. Ideal for purchase orders and institutional payments.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="rounded-3xl border border-line bg-paper lg:sticky lg:top-28">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-lg font-bold text-ink">Order summary</h2>
            <span className="text-sm text-ink-3">{units} {units === 1 ? 'item' : 'items'}</span>
          </div>
          <ul data-lenis-prevent className="max-h-[360px] divide-y divide-line overflow-y-auto">
            {items.map((x) => {
              const qty = x.qty ?? 1;
              return (
                <li key={x.slug} className="flex gap-4 px-6 py-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas">
                    {x.image && <Image src={x.image} alt="" fill sizes="64px" className="object-contain p-1.5 mix-blend-multiply" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-ink">{x.name}</p>
                    <p className="text-sm text-ink-3">{x.brand}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-line">
                        <button type="button" onClick={() => quoteList.setQty(x.slug, qty - 1)} aria-label={`One fewer ${x.name}`} className="grid size-8 place-items-center text-ink-2 hover:bg-mist disabled:opacity-40" disabled={qty <= 1}><Minus className="size-4" /></button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{qty}</span>
                        <button type="button" onClick={() => quoteList.setQty(x.slug, qty + 1)} aria-label={`One more ${x.name}`} className="grid size-8 place-items-center text-ink-2 hover:bg-mist"><Plus className="size-4" /></button>
                      </div>
                      <button type="button" onClick={() => quoteList.remove(x.slug)} aria-label={`Remove ${x.name}`} className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-mist hover:text-signal-700"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2.5 border-t border-line px-6 py-5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-ink-3">Delivery &amp; installation</dt><dd className="font-medium text-ink">Arranged with your order</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-ink-3">Training</dt><dd className="font-medium text-ink">Included</dd></div>
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-base"><dt className="font-semibold text-ink">Total</dt><dd className="font-bold text-ink">Shown on the payment page</dd></div>
          </dl>
          <div className="px-6 pb-6">
            <button type="submit" disabled={busy} className="flex h-14 w-full items-center justify-center gap-2 bg-brand-600 text-base font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
              <Lock className="size-5" aria-hidden /> {busy ? 'Opening secure payment…' : 'Pay securely'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-3"><ShieldCheck className="size-4 text-brand-600" aria-hidden /> Encrypted payment · Official distributor</p>
          </div>
        </aside>
      </form>

      {/* Payment window: the provider's secure page opens here once a payment platform is connected */}
      <AnimatePresence>
        {paying && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-midnight/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPaying(null)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pay-title"
              initial={{ y: 16, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-paper shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]"
            >
              <div className="flex items-center justify-between bg-midnight px-6 py-4 text-white">
                <p className="flex items-center gap-2 font-semibold"><Lock className="size-4 text-brand-300" aria-hidden /> Secure payment</p>
                <button type="button" onClick={() => setPaying(null)} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-5" /></button>
              </div>
              <div className="p-6">
                <h2 id="pay-title" className="text-xl font-bold text-ink">Online payment is coming soon</h2>
                <p className="mt-2 text-ink-2">
                  This is where our payment partner’s secure page will open to take your {methods.find((m) => m.id === paying.method)?.label.toLowerCase()} payment. Until it is switched on, send the order to our sales team and they will confirm the total and how to pay.
                </p>
                <dl className="mt-5 space-y-2 rounded-2xl bg-canvas p-4 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-ink-3">Order reference</dt><dd className="font-semibold tabular-nums text-ink">{paying.reference}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ink-3">Items</dt><dd className="font-semibold text-ink">{units}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ink-3">Deliver to</dt><dd className="text-right font-semibold text-ink">{paying.customer.organisation}, {paying.customer.region}</dd></div>
                </dl>
                <div className="mt-6 grid gap-2">
                  <Link href={quoteHref(items)} className="flex h-12 items-center justify-center bg-brand-600 font-semibold text-white hover:bg-brand-700">Send order to sales</Link>
                  <a href={contact.phoneHref} className="flex h-12 items-center justify-center border border-line font-semibold text-ink hover:border-ink/30">Call {contact.phone}</a>
                </div>
                <p className="mt-4 text-center text-sm text-ink-3">
                  Saved to your hospital dashboard.{' '}
                  <Link href="/portal?view=orders" className="font-medium text-brand-700 hover:underline">View your orders</Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
