'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { orderHref } from '@/lib/links';
import { quoteList, type QuoteItem } from '@/lib/quote-list';

/**
 * "Request a quote" for one product, without a wait: the product goes on the quote list in the browser straight away
 * and the quote page (fetched ahead, as soon as this button is on screen) opens. Before, the button went to
 * /checkout?add=…, which the server had to draw on every click before anything changed, and then reloaded itself.
 * The address still carries ?add=… so a new tab, Ctrl-click or a page without JavaScript works as before.
 */
export function RequestQuoteLink({ item, className, children }: { item: QuoteItem; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => router.prefetch('/checkout'), [router]);
  return (
    <Link
      href={orderHref(item.slug)}
      prefetch={false}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        quoteList.add(item);
        router.push('/checkout');
      }}
    >
      {children}
    </Link>
  );
}
