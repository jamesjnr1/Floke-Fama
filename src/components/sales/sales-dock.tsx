'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { track } from '@/lib/analytics';
import { quoteList, useQuoteList } from '@/lib/quote-list';
import { cn } from '@/lib/utils';

/**
 * Bottom-right on every public page: the visitor's quote list (once it has something in it)
 * and a WhatsApp button that opens a chat with sales, mentioning the product being viewed.
 */
export function SalesDock() {
  const { contact } = useSite();
  const pathname = usePathname();
  const items = useQuoteList();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  // Count calls, WhatsApp links and brochure downloads anywhere on the site
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) track('call_click', { page: location.pathname });
      else if (href.includes('wa.me')) track('whatsapp_click', { page: location.pathname });
      else if (a.hasAttribute('download') && href.includes('brochure')) track('brochure_download', { page: location.pathname });
      else if (href.includes('docs=1')) track('datasheet_request', { page: location.pathname });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const onQuotePage = pathname.startsWith('/quote') || pathname.startsWith('/checkout');
  const onProduct = /^\/products\/[^/]+/.test(pathname);

  const whatsapp = () => {
    const product = onProduct ? document.querySelector('h1')?.textContent?.trim() : undefined;
    const text = product
      ? `Hello Flokefama, I'm interested in the ${product}. ${location.href}`
      : 'Hello Flokefama, I would like some information about your products and services.';
    track('whatsapp_click', { page: pathname, ...(product ? { product } : {}) });
    window.open(`${contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    // On phones, product pages have their own sticky bar, so the dock sits above it
    <div className={cn('fixed right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6', onProduct ? 'bottom-24' : 'bottom-4')}>
      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Your cart"
            className="w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-paper shadow-[0_30px_60px_-20px_rgb(11_21_16/0.45)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-semibold text-ink">Your cart <span className="font-normal text-ink-3">({items.length})</span></p>
              <button type="button" onClick={() => quoteList.clear()} className="text-xs text-ink-3 hover:text-ink">Clear</button>
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {items.map((x) => (
                <li key={x.slug} className="flex items-center gap-3 px-5 py-3">
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                    {x.image && <Image src={x.image} alt="" fill sizes="44px" className="object-contain p-1" />}
                  </span>
                  <Link href={`/products/${x.slug}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{x.name}</span>
                    <span className="text-xs text-ink-3">{x.brand}</span>
                  </Link>
                  <button type="button" onClick={() => quoteList.remove(x.slug)} aria-label={`Remove ${x.name}`} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-mist hover:text-ink">
                    <Icon name="fi-rr-cross-small" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <Link
                href="/checkout"
                onClick={() => {
                  track('quote_list_request', { items: items.length });
                  setOpen(false);
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Check out {items.length === 1 ? '1 item' : `${items.length} items`}
              </Link>
              <p className="mt-2 text-center text-xs text-ink-3">Pay securely by Mobile Money, card or bank transfer.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {items.length > 0 && !onQuotePage && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex h-12 items-center gap-2 rounded-full bg-midnight pl-4 pr-5 text-sm font-medium text-white shadow-[0_14px_30px_-12px_rgb(11_21_16/0.7)] transition hover:bg-black"
          >
            <Icon name="fi-rr-shopping-cart" className="text-base" />
            Cart
            <span className="grid min-w-6 place-items-center rounded-full bg-brand-500 px-1.5 text-xs">{items.length}</span>
          </button>
        )}
        <button
          type="button"
          onClick={whatsapp}
          aria-label="Chat with Flokefama sales on WhatsApp"
          title="Chat on WhatsApp"
          className="grid size-12 place-items-center rounded-full bg-[#25D366] text-2xl text-white shadow-[0_8px_20px_-8px_rgb(11_21_16/0.35)] transition hover:scale-105"
        >
          <Icon name="fi-brands-whatsapp" />
        </button>
      </div>
    </div>
  );
}
