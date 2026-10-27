import type { OrderStatus } from '@/lib/orders';

/** The admin console's sales board: its columns, in order. Orders arrive in New and sales moves them along. */
export const salesStages: { id: OrderStatus; label: string }[] = [
  { id: 'awaiting-payment', label: 'New' },
  { id: 'called', label: 'Called' },
  { id: 'priced', label: 'Price sent' },
  { id: 'paid', label: 'Paid' },
  { id: 'processing', label: 'Being prepared' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'lost', label: 'Lost' },
];

export const stageLabel = (s: OrderStatus) => salesStages.find((x) => x.id === s)?.label ?? s;
