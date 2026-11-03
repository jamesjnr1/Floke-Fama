'use client';

import { useActionState, useState } from 'react';
import { clearTestOrders, type ClearOrdersState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';

/** Admin console → Database & settings → Clear test orders (with a typed confirmation: it can't be undone). */
export function ClearOrdersForm({ orders }: { orders: number }) {
  const [state, action, pending] = useActionState<ClearOrdersState, FormData>(clearTestOrders, {});
  const [typed, setTyped] = useState('');
  if (state.done)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-[#e8f5ee] px-4 py-3 text-[0.9375rem] text-brand-800">
        <Icon name="fi-rr-check-circle" className="mt-0.5" />
        Cleared {state.done.orders} order{state.done.orders === 1 ? '' : 's'}
        {state.done.assets || state.done.tickets ? `, ${state.done.assets} item${state.done.assets === 1 ? '' : 's'} of equipment and ${state.done.tickets} installation job${state.done.tickets === 1 ? '' : 's'} they added` : ''}. The order figures and Product demand start again from nothing.
      </p>
    );
  return (
    <form action={action}>
      <p className="text-[0.9375rem] text-ink-3">
        Deletes every order ({orders} now), so the dashboard’s order figures and Product demand start again from nothing. Use it once, to remove the orders placed while testing. Accounts, hospitals, engineers and service requests stay. It can’t be undone.
      </p>
      <label className="mt-3 flex items-start gap-2.5 text-[0.9375rem]">
        <input type="checkbox" name="equipment" defaultChecked className="mt-1 size-4 accent-[#b42335]" />
        <span>Also remove the equipment and installation jobs those orders added to hospitals’ records</span>
      </label>
      <label htmlFor="clear-confirm" className="mt-4 block text-[0.875rem] font-medium">Type DELETE ORDERS to confirm</label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <input id="clear-confirm" name="confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" className="h-11 w-56 rounded-xl border border-line bg-white px-3.5 font-mono text-[0.9375rem] uppercase outline-none focus:border-signal" />
        <button disabled={pending || typed.trim().toUpperCase() !== 'DELETE ORDERS'} className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-[#8f1c2a] disabled:opacity-50">
          <Icon name="fi-rr-trash" /> {pending ? 'Clearing…' : 'Clear test orders'}
        </button>
      </div>
      {state.error && <p role="alert" className="mt-2 text-[0.875rem] text-signal-700">{state.error}</p>}
    </form>
  );
}
