'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CreditCard, Landmark, Lock, Minus, Plus, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSite } from '@/components/site-provider';
import { track } from '@/lib/analytics';
import { useSession } from '@/lib/auth/use-session';
import { saveOrder } from '@/lib/orders';
import { orderReference, startPayment, type CheckoutOrder, type PaymentMethod } from '@/lib/payments';
import { quoteHref, quoteList, useQuoteList } from '@/lib/quote-list';
import { cn } from '@/lib/utils';

const regions = ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Volta', 'Northern', 'Bono', 'Bono East', 'Upper East', 'Upper West', 'Other'];
const networks = ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'];
const steps = ['Your cart', 'Delivery details', 'Payment method', 'Confirmation'] as const;

const field = 'h-11 w-full rounded-lg border border-line bg-canvas px-3.5 text-base text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:bg-paper focus:ring-4 focus:ring-brand-500/15';
const labelCls = 'mb-1.5 block text-sm text-ink-3';

const methods: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone; badges: string[] }[] = [
  { id: 'momo', label: 'Mobile Money', hint: 'Approve the payment with a prompt on your phone.', icon: Smartphone, badges: ['MTN', 'Telecel', 'AirtelTigo'] },
  { id: 'card', label: 'Credit or debit card', hint: 'Pay on our payment partner’s secure page. Flokefama never sees your card number.', icon: CreditCard, badges: ['VISA', 'Mastercard'] },
  { id: 'bank', label: 'Bank transfer', hint: 'We send an invoice with our bank details and your order reference. Ideal for purchase orders.', icon: Landmark, badges: ['Invoice'] },
];

type Details = { name: string; organisation: string; phone: string; email: string; region: string; address: string };
const emptyDetails: Details = { name: '', organisation: '', phone: '', email: '', region: 'Greater Accra', address: '' };

/** Checkout in four steps (cart, delivery, payment, confirmation) with the order summary alongside. */
export function Checkout() {
  const { contact } = useSite();
  const items = useQuoteList();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [method, setMethod] = useState<PaymentMethod>('momo');
  const [network, setNetwork] = useState(networks[0]);
  const [momo, setMomo] = useState('');
  const [placed, setPlaced] = useState<CheckoutOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const units = items.reduce((n, x) => n + (x.qty ?? 1), 0);

  // Fill in the signed-in hospital's details once the session is known
  useEffect(() => {
    if (!user) return;
    setDetails((d) => ({
      ...d,
      name: d.name || user.name,
      organisation: d.organisation || user.facility || '',
      phone: d.phone || user.phone || '',
      email: d.email || user.email,
    }));
  }, [user]);

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const next = async () => {
    setError('');
    if (step === 1) {
      const missing = (['name', 'organisation', 'phone', 'email', 'address'] as const).find((k) => details[k].trim().length < 2);
      if (missing) return setError('Please fill in all delivery details.');
      if (!/^\S+@\S+\.\S+$/.test(details.email)) return setError('Enter a valid email address.');
    }
    if (step === 2) {
      if (method === 'momo' && momo.replace(/\D/g, '').length < 9) return setError('Enter the Mobile Money number to charge.');
      const order: CheckoutOrder = {
        reference: orderReference(),
        items: items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty ?? 1 })),
        customer: details,
        method,
        momo: method === 'momo' ? { network, number: momo } : undefined,
      };
      setBusy(true);
      track('checkout_pay', { items: units, method });
      const result = await startPayment(order);
      setBusy(false);
      if (result.status === 'redirect') {
        window.location.href = result.url;
        return;
      }
      if (user) saveOrder(order, user.email);
      setPlaced(order);
    }
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (items.length === 0 && !placed)
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-paper p-10 text-center">
        <p className="text-2xl font-bold text-ink">Your cart is empty</p>
        <p className="mt-2 text-ink-3">Add equipment from the shop with the + button, then come back here to pay.</p>
        <Link href="/products" className="mt-6 inline-flex h-12 items-center rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">Browse the catalogue</Link>
      </div>
    );

  const cta = ['Continue to delivery', 'Continue to payment', busy ? 'Opening secure payment…' : 'Make payment'][step];
  const summaryItems = placed ? placed.items : items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty ?? 1 }));

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-paper shadow-[0_40px_80px_-50px_rgb(11_21_16/0.45)] lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Steps + current step */}
      <div className="p-5 md:p-8 lg:p-10">
        <nav aria-label="Checkout steps" className="-mx-1 flex overflow-x-auto border-b border-line">
          {steps.map((s, i) => {
            const done = i < step && step < 3;
            return (
              <button
                key={s}
                type="button"
                disabled={!done}
                onClick={() => setStep(i)}
                aria-current={i === step ? 'step' : undefined}
                className={cn(
                  'relative flex-1 whitespace-nowrap px-3 pb-3.5 text-center text-sm transition-colors',
                  i === step ? 'font-semibold text-ink' : done ? 'text-ink-2 hover:text-ink' : 'text-ink-3/70',
                )}
              >
                {s}
                {i === step && <motion.span layoutId="checkout-step" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />}
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="pt-7">
            {step === 0 && (
              <>
                <h2 className="font-semibold text-ink">Your cart</h2>
                <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                  {items.map((x) => {
                    const qty = x.qty ?? 1;
                    return (
                      <li key={x.slug} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                          {x.image && <Image src={x.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                        </span>
                        <span className="min-w-0 flex-1 basis-40">
                          <span className="block break-words text-sm font-semibold leading-snug text-ink">{x.name}</span>
                          <span className="text-sm text-ink-3">{x.brand}</span>
                        </span>
                        <span className="ml-auto flex items-center rounded-lg border border-line">
                          <button type="button" onClick={() => quoteList.setQty(x.slug, qty - 1)} aria-label={`One fewer ${x.name}`} className="grid size-8 place-items-center text-ink-2 hover:bg-mist disabled:opacity-40" disabled={qty <= 1}><Minus className="size-4" /></button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{qty}</span>
                          <button type="button" onClick={() => quoteList.setQty(x.slug, qty + 1)} aria-label={`One more ${x.name}`} className="grid size-8 place-items-center text-ink-2 hover:bg-mist"><Plus className="size-4" /></button>
                        </span>
                        <button type="button" onClick={() => quoteList.remove(x.slug)} aria-label={`Remove ${x.name}`} className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-mist hover:text-signal-700"><Trash2 className="size-4" /></button>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/products" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">+ Add more equipment</Link>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-semibold text-ink">Delivery details</h2>
                <div className="mt-4 grid gap-4 rounded-xl border border-line p-5 sm:grid-cols-2">
                  <label><span className={labelCls}>Contact name</span><input value={details.name} onChange={set('name')} autoComplete="name" className={field} /></label>
                  <label><span className={labelCls}>Hospital / facility</span><input value={details.organisation} onChange={set('organisation')} autoComplete="organization" className={field} /></label>
                  <label><span className={labelCls}>Phone</span><input value={details.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+233" className={field} /></label>
                  <label><span className={labelCls}>Email</span><input value={details.email} onChange={set('email')} type="email" autoComplete="email" className={field} /></label>
                  <label><span className={labelCls}>Region</span>
                    <select value={details.region} onChange={set('region')} className={field}>{regions.map((r) => <option key={r}>{r}</option>)}</select>
                  </label>
                  <label><span className={labelCls}>Delivery address</span><input value={details.address} onChange={set('address')} autoComplete="street-address" placeholder="Town, street, landmark" className={field} /></label>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-ink">Payment method</h2>
                  <span className="flex items-center gap-1.5 text-sm text-ink-3"><Lock className="size-3.5" aria-hidden /> Secure payment</span>
                </div>
                <div role="radiogroup" aria-label="Payment method" className="mt-4 space-y-3">
                  {methods.map((m) => {
                    const on = method === m.id;
                    return (
                      <div key={m.id} className={cn('rounded-xl border transition', on ? 'border-brand-600 bg-paper shadow-[0_0_0_3px_rgb(0_122_77/0.08)]' : 'border-line bg-canvas/60')}>
                        <button type="button" role="radio" aria-checked={on} onClick={() => setMethod(m.id)} className="flex w-full items-start gap-3 p-5 text-left">
                          <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-brand-600' : 'border-ink-3/40')}>
                            {on && <span className="size-2.5 rounded-full bg-brand-600" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-ink">{m.label}</span>
                              <span className="flex gap-1">{m.badges.map((b) => <span key={b} className="rounded border border-line bg-paper px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-ink-2">{b}</span>)}</span>
                            </span>
                            <span className="mt-1 block text-sm text-ink-3">{m.hint}</span>
                          </span>
                        </button>
                        {on && m.id === 'momo' && (
                          <div className="mx-5 grid gap-4 border-t border-dashed border-line py-5 sm:grid-cols-2">
                            <label><span className={labelCls}>Network</span>
                              <select value={network} onChange={(e) => setNetwork(e.target.value)} className={field}>{networks.map((n) => <option key={n}>{n}</option>)}</select>
                            </label>
                            <label><span className={labelCls}>Mobile Money number</span><input value={momo} onChange={(e) => setMomo(e.target.value)} type="tel" placeholder="024 000 0000" className={field} /></label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && placed && (
              <div className="py-4 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Check className="size-7" strokeWidth={2.5} /></span>
                <h2 className="mt-5 text-2xl font-bold text-ink">Order {placed.reference} received</h2>
                <p className="mx-auto mt-2 max-w-md text-ink-2">
                  Online payment is being switched on. Until then our sales team confirms the total and how to pay by {methods.find((m) => m.id === placed.method)?.label.toLowerCase()}.
                </p>
                <div className="mx-auto mt-6 grid max-w-sm gap-2">
                  <Link href={quoteHref(items)} className="flex h-12 items-center justify-center rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700">Send order to sales</Link>
                  <a href={contact.phoneHref} className="flex h-12 items-center justify-center rounded-lg border border-line font-semibold text-ink hover:border-ink/30">Call {contact.phone}</a>
                  <Link href="/portal?view=orders" className="mt-2 text-sm font-medium text-brand-700 hover:underline">View your orders in the dashboard</Link>
                </div>
              </div>
            )}

            {error && <p role="alert" className="mt-4 text-sm text-signal-700">{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Order summary */}
      <aside className="relative bg-brand-600 p-6 pb-10 text-white md:p-8 md:pb-12">
        <div className="flex items-center justify-between border-b border-white/30 pb-4">
          <h2 className="text-lg font-semibold text-white">Order summary</h2>
          {step > 0 && step < 3 && <button type="button" onClick={() => setStep(0)} className="text-sm text-white/80 hover:text-white">Edit</button>}
        </div>
        <ul className="space-y-2.5 py-5 text-sm">
          {summaryItems.map((x) => (
            <li key={x.slug} className="flex justify-between gap-4">
              <span className="min-w-0 break-words text-white/90">{x.name}</span>
              <span className="shrink-0 tabular-nums">× {x.qty}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-dashed border-white/30 py-5 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-white/75">Items</dt><dd>{placed ? placed.items.reduce((n, x) => n + x.qty, 0) : units}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/75">Deliver to</dt><dd className="text-right">{details.address ? `${details.region}` : '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/75">Payment</dt><dd>{step >= 2 ? methods.find((m) => m.id === method)?.label : '—'}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/75">Installation & training</dt><dd>Included</dd></div>
        </dl>
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-white/80 pt-5">
          <span className="text-sm text-white/80">Total</span>
          <span className="text-right text-lg font-bold">Confirmed on payment</span>
        </div>
        {step < 3 && (
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#e8ab00] font-semibold text-ink transition hover:bg-[#f5bb12] disabled:opacity-60"
          >
            {step === 2 && <Lock className="size-4" aria-hidden />} {cta}
          </button>
        )}
        {/* Ticket edge */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-[radial-gradient(circle_at_8px_12px,var(--color-canvas)_6px,transparent_6.5px)] bg-[length:16px_12px] bg-repeat-x" />
      </aside>
    </div>
  );
}
