'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CheckoutOrder, PaymentMethod } from '@/lib/payments';

/**
 * Orders placed at checkout, shown on the hospital dashboard; each belongs to the account's email.
 * With Appwrite set up they are saved on the server (/api/orders), which also turns them into the hospital's
 * equipment, so they show on every device. Without it they are kept in this browser, like the cart.
 */
export type OrderStatus = 'awaiting-payment' | 'paid' | 'processing' | 'delivered';

export interface SavedOrder {
  reference: string;
  placedAt: string;
  account: string;
  items: CheckoutOrder['items'];
  method: PaymentMethod;
  region: string;
  address: string;
  status: OrderStatus;
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  'awaiting-payment': 'Awaiting payment',
  paid: 'Paid',
  processing: 'Being prepared',
  delivered: 'Delivered',
};

const KEY = 'ff-orders';
const EMPTY: SavedOrder[] = [];
let cache: { raw: string | null; list: SavedOrder[] } = { raw: null, list: EMPTY };
const listeners = new Set<() => void>();

function read(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, list: raw ? (JSON.parse(raw) as SavedOrder[]) : EMPTY };
  } catch {
    /* storage unavailable */
  }
  return cache.list;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

/** Orders from the server, for every hook on the page; `null` until asked, `false` when the server doesn't keep them. */
let remote: Promise<SavedOrder[] | false> | null = null;
const askServer = (fresh = false) =>
  (remote = !fresh && remote ? remote : fetch('/api/orders', { cache: 'no-store' })
    .then(async (r) => {
      const out = (await r.json()) as { enabled: boolean; orders?: SavedOrder[] };
      return out.enabled && r.ok ? (out.orders ?? []) : false;
    })
    .catch(() => false as const));

/** Record an order from checkout (replaces one with the same reference). */
export function saveOrder(order: CheckoutOrder, account: string) {
  // On the server too (where it also becomes the hospital's equipment); harmless when the server doesn't keep orders
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference: order.reference, items: order.items, method: order.method, region: order.customer.region, address: order.customer.address }),
    keepalive: true,
  })
    .then(() => askServer(true))
    .then(() => listeners.forEach((l) => l()))
    .catch(() => {});
  const saved: SavedOrder = {
    reference: order.reference,
    placedAt: new Date().toISOString(),
    account: account.toLowerCase(),
    items: order.items,
    method: order.method,
    region: order.customer.region,
    address: order.customer.address,
    status: 'awaiting-payment',
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([saved, ...read().filter((o) => o.reference !== order.reference)].slice(0, 50)));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

/** This account's orders, newest first: from the server when it keeps them, else from this browser. */
export function useOrders(account: string | undefined) {
  const all = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [server, setServer] = useState<SavedOrder[] | false | null>(null);
  useEffect(() => {
    let live = true;
    const load = (fresh: boolean) => askServer(fresh).then((r) => live && setServer(r));
    load(false);
    const onChange = () => load(false);
    listeners.add(onChange);
    return () => {
      live = false;
      listeners.delete(onChange);
    };
  }, []);
  if (server) return server;
  return account ? all.filter((o) => o.account === account.toLowerCase()) : EMPTY;
}
