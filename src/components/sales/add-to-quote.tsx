'use client';

import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { quoteList, useQuoteList, type QuoteItem } from '@/lib/quote-list';
import { cn } from '@/lib/utils';

/** Adds a product to the visitor's quote list (or removes it). `compact` is the round button on catalogue cards. */
export function AddToQuote({ item, compact, className }: { item: QuoteItem; compact?: boolean; className?: string }) {
  const list = useQuoteList();
  const added = list.some((x) => x.slug === item.slug);
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    quoteList.toggle(item);
    if (!added) toast.success('Added to your cart', { description: `${item.name}. Add more, then check out once for all of them.` });
  };
  const label = added ? `Remove ${item.name} from cart` : `Add ${item.name} to cart`;

  if (compact)
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={added}
        aria-label={label}
        title={added ? 'In your cart' : 'Add to cart'}
        className={cn(
          'grid size-9 place-items-center rounded-full shadow-[0_6px_16px_-8px_rgb(11_21_16/0.5)] ring-1 transition sm:size-10',
          added ? 'bg-brand-600 text-white ring-brand-600' : 'bg-paper/95 text-ink ring-line backdrop-blur hover:bg-brand-600 hover:text-white hover:ring-brand-600',
          className,
        )}
      >
        <Icon name={added ? 'fi-rr-check' : 'fi-rr-plus'} />
      </button>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={added}
      className={cn(
        'inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium ring-1 transition',
        added ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'text-ink ring-line hover:ring-ink/30',
        className,
      )}
    >
      <Icon name={added ? 'fi-rr-check' : 'fi-rr-plus'} /> {added ? 'In your cart' : 'Add to cart'}
    </button>
  );
}
