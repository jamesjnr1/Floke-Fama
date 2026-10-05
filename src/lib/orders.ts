'use client';

import { useSyncExternalStore } from 'react';
import type { CheckoutOrder, PaymentMethod } from '@/lib/payments';

/**
 * Orders placed at checkout, shown on the hospital dashboard. Kept in this browser (like the cart) until
 * orders are stored by the payment platform or a database; each order belongs to the account's email.
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

/** Record an order from checkout (replaces one with the same reference). */
export function saveOrder(order: CheckoutOrder, account: string) {
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

/** This account's orders, newest first. */
export function useOrders(account: string | undefined) {
  const all = useSyncExternalStore(subscribe, read, () => EMPTY);
  return account ? all.filter((o) => o.account === account.toLowerCase()) : EMPTY;
}
