'use client';

import { useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics';

/**
 * The visitor's quote list: several products gathered while browsing, sent as one quote request.
 * Kept in this browser only (localStorage), so it survives page changes and reloads.
 */
export interface QuoteItem { slug: string; name: string; brand: string; image?: string }

const KEY = 'ff-quote-list';
const EVENT = 'ff-quote-list';
const EMPTY: QuoteItem[] = [];
let cache: QuoteItem[] | null = null;

function read(): QuoteItem[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(raw) ? raw.filter((x) => x && typeof x.slug === 'string') : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: QuoteItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private mode: the list still works for this page view
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(fn: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener('storage', onStorage);
  };
}

export function useQuoteList() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const quoteList = {
  has: (slug: string) => read().some((x) => x.slug === slug),
  add(item: QuoteItem) {
    if (read().some((x) => x.slug === item.slug)) return;
    write([...read(), item]);
    track('quote_list_add', { product: item.slug });
  },
  remove: (slug: string) => write(read().filter((x) => x.slug !== slug)),
  toggle(item: QuoteItem) {
    if (quoteList.has(item.slug)) quoteList.remove(item.slug);
    else quoteList.add(item);
  },
  clear: () => write([]),
};

/** The quote page link for a list of products. */
export const quoteHref = (items: QuoteItem[]) => `/quote?products=${items.map((x) => x.slug).join(',')}`;
