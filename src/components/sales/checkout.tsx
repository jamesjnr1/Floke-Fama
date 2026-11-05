'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/components/site-provider';
import { track } from '@/lib/analytics';
import { useSession } from '@/lib/auth/use-session';
import { composeLinks } from '@/lib/compose';
import { departments, timelines } from '@/lib/order-needs';
import { saveOrder } from '@/lib/orders';
import { orderReference, type CheckoutOrder } from '@/lib/payments';
import { quoteList, useQuoteList, type QuoteItem } from '@/lib/quote-list';
import { cn } from '@/lib/utils';

const regions = ['Greater Accra', 'Ashanti', 'Central', 'Eastern', 'Western', 'Volta', 'Northern', 'Bono', 'Bono East', 'Upper East', 'Upper West', 'Other'];
const steps = ['Your quote list', 'Your details', 'Request sent'] as const;

const field = 'h-11 w-full rounded-lg border border-line bg-canvas px-3.5 text-base text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:bg-paper focus:ring-4 focus:ring-brand-500/15';
const labelCls = 'mb-1.5 block text-sm text-ink-3';

type Details = { name: string; organisation: string; phone: string; email: string; region: string; address: string; department: string; timeline: string; notes: string };
const emptyDetails: Details = { name: '', organisation: '', phone: '', email: '', region: 'Greater Accra', address: '', department: '', timeline: 'quarter', notes: '' };

/**
 * The shop works on quotes: a hospital lists what it needs, gives its details and sends a quote request (three steps,
 * with the summary alongside). "Request a quote" anywhere on the site lands here with the product on the list
 * (`adding`). Nothing is paid here: sales sends a quote with the price, and payment is agreed with them after. The
 * request goes on the sales board (admin console) and the hospital's dashboard.
 */
export function Checkout({ adding = [] }: { adding?: QuoteItem[] }) {
  const { contact } = useSite();
  const router = useRouter();
  const items = useQuoteList();
  // Products from a "Request a quote" link go on the list once, then the address is tidied
  const added = useRef(false);
  useEffect(() => {
    if (added.current || adding.length === 0) return;
    added.current = true;
    for (const item of adding) quoteList.add(item);
    router.replace('/checkout', { scroll: false });
  }, [adding, router]);
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [placed, setPlaced] = useState<CheckoutOrder | null>(null);
  /** Sales has the order in the CRM (null while sending). */
  const [withSales, setWithSales] = useState<boolean | null>(null);
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

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const next = async () => {
    setError('');
    if (step === 1) {
      const missing = (['name', 'organisation', 'phone', 'email', 'address'] as const).find((k) => details[k].trim().length < 2);
      if (missing) return setError('Please fill in all your details.');
      if (!/^\S+@\S+\.\S+$/.test(details.email)) return setError('Enter a valid email address.');
      const order: CheckoutOrder = {
        reference: orderReference(),
        items: items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty ?? 1 })),
        customer: details,
        method: 'quote',
        needs: { department: details.department, timeline: details.timeline, notes: details.notes.trim() },
      };
      setBusy(true);
      track('quote_list_request', { items: units });
      setWithSales(null);
      const sent = user ? await saveOrder(order, user.email).catch(() => false) : false;
      setWithSales(sent);
      setBusy(false);
      setPlaced(order);
      // The request is sent: the list starts empty again (the summary shows what was sent)
      quoteList.clear();
    }
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (items.length === 0 && !placed && adding.length === 0)
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-paper p-10 text-center">
        <p className="text-2xl font-bold text-ink">Your quote list is empty</p>
        <p className="mt-2 text-ink-3">Add equipment from the shop with the + button, then come back here to request a quote.</p>
        <Link href="/products" className="mt-6 inline-flex h-12 items-center rounded-lg bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700">Browse the catalogue</Link>
      </div>
    );

  const cta = ['Continue to your details', busy ? 'Sending…' : 'Request quote'][step];
  const summaryItems = placed ? placed.items : items.map((x) => ({ slug: x.slug, name: x.name, qty: x.qty ?? 1 }));

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-paper shadow-[0_40px_80px_-50px_rgb(11_21_16/0.45)] lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* Steps + current step */}
      <div className="p-5 md:p-8 lg:p-10">
        <nav aria-label="Quote request steps" className="-mx-1 flex overflow-x-auto border-b border-line [scrollbar-width:none]">
          {steps.map((s, i) => {
            const done = i < step && step < 2;
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
                <h2 className="font-semibold text-ink">Your quote list</h2>
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
                <h2 className="font-semibold text-ink">Your details</h2>
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
                <h2 className="mt-7 font-semibold text-ink">About the request</h2>
                <div className="mt-4 grid gap-4 rounded-xl border border-line p-5 sm:grid-cols-2">
                  <label><span className={labelCls}>Department <span className="text-ink-3/70">(optional)</span></span>
                    <select value={details.department} onChange={set('department')} className={field}>
                      <option value="">Not sure / several</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                  </label>
                  <label><span className={labelCls}>When do you need it?</span>
                    <select value={details.timeline} onChange={set('timeline')} className={field}>
                      {timelines.map((t) => <option key={t.id} value={t.id}>{t.label}: {t.detail.toLowerCase()}</option>)}
                    </select>
                  </label>
                  <label className="sm:col-span-2"><span className={labelCls}>Notes for our sales team <span className="text-ink-3/70">(optional)</span></span>
                    <textarea value={details.notes} onChange={set('notes')} rows={3} maxLength={1000} placeholder="e.g. Configuration, a tender deadline, installation needs" className={cn(field, 'h-auto resize-none py-2.5')} />
                  </label>
                </div>
              </>
            )}

            {step === 2 && placed && (
              <div className="py-4 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Check className="size-7" strokeWidth={2.5} /></span>
                <h2 className="mt-5 text-2xl font-bold text-ink">Quote request {placed.reference} sent</h2>
                <p className="mx-auto mt-2 max-w-md text-ink-2">
                  {withSales
                    ? 'Our sales team has your request. They will call you and send a quote with the price. How to pay is agreed with them after you accept it.'
                    : 'Please send your request to our sales team below, or call them. They will send you a quote with the price.'}
                </p>
                <div className="mx-auto mt-6 grid max-w-sm gap-2">
                  {withSales === false && <SendToSales order={placed} />}
                  <a href={contact.phoneHref} className="flex h-12 items-center justify-center rounded-lg border border-line font-semibold text-ink hover:border-ink/30">Call {contact.phone}</a>
                  <Link href="/portal?view=orders" className="mt-2 text-sm font-medium text-brand-700 hover:underline">View your quotes in the dashboard</Link>
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
          <h2 className="text-lg font-semibold text-white">Quote summary</h2>
          {step > 0 && step < 2 && <button type="button" onClick={() => setStep(0)} className="text-sm text-white/80 hover:text-white">Edit</button>}
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
          <div className="flex justify-between gap-4"><dt className="text-white/75">Payment</dt><dd>Agreed with sales</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/75">Installation & training</dt><dd>Included</dd></div>
        </dl>
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-white/80 pt-5">
          <span className="text-sm text-white/80">Price</span>
          <span className="text-right text-lg font-bold">In your quote</span>
        </div>
        {step < 2 && (
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#e8ab00] font-semibold text-ink transition hover:bg-[#f5bb12] disabled:opacity-60"
          >
            {cta}
          </button>
        )}
        {/* Ticket edge */}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-[radial-gradient(circle_at_8px_12px,var(--color-canvas)_6px,transparent_6.5px)] bg-[length:16px_12px] bg-repeat-x" />
      </aside>
    </div>
  );
}

/** When sales couldn't be told automatically: the whole request, pre-filled, by email or WhatsApp. */
function SendToSales({ order }: { order: CheckoutOrder }) {
  const { contact } = useSite();
  const c = order.customer;
  const links = composeLinks({
    to: contact.sales,
    whatsapp: contact.whatsapp,
    subject: `Quote request ${order.reference}: ${c.organisation}`,
    body: [
      ...order.items.map((x) => `• ${x.name} × ${x.qty}`),
      '',
      order.needs?.department ? `Department: ${departments.find((d) => d.id === order.needs!.department)?.label}` : undefined,
      order.needs ? `Needed: ${timelines.find((t) => t.id === order.needs!.timeline)?.label}` : undefined,
      order.needs?.notes ? `Notes: ${order.needs.notes}` : undefined,
      `Deliver to: ${c.address}, ${c.region}`,
      `From: ${c.name}, ${c.organisation} · ${c.phone} · ${c.email}`,
    ].filter((l) => typeof l === 'string').join('\n'),
  });
  return (
    <div className="grid grid-cols-2 gap-2">
      <a href={links.email} className="flex h-12 items-center justify-center rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700">Email it to sales</a>
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-lg border border-line font-semibold text-ink hover:border-ink/30">WhatsApp</a>
    </div>
  );
}
