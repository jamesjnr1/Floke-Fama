'use client';

import { useActionState } from 'react';
import { assignEngineer, type AssignState } from '@/lib/admin/actions';
import { cn } from '@/lib/utils';

/** Admin console → Service desk → a job nobody has taken: choose an engineer and give it to them. */
export function AssignForm({ ticket, engineers }: { ticket: string; engineers: { email: string; name: string }[] }) {
  const [state, action, pending] = useActionState<AssignState, FormData>(assignEngineer, {});
  if (state.result?.ok) return <p role="status" className="text-[0.875rem] font-medium text-brand-700">{state.result.detail}</p>;
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="ticket" value={ticket} />
      <label className="sr-only" htmlFor={`assign-${ticket}`}>Engineer for {ticket}</label>
      <select id={`assign-${ticket}`} name="engineer" required defaultValue="" className="h-9 rounded-lg border border-line bg-white px-2 text-[0.875rem]">
        <option value="" disabled>Choose an engineer…</option>
        {engineers.map((e) => (
          <option key={e.email} value={e.email}>{e.name}</option>
        ))}
      </select>
      <button disabled={pending || !engineers.length} className="h-9 rounded-lg bg-brand-700 px-3 text-[0.875rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
        {pending ? 'Assigning…' : 'Assign'}
      </button>
      {state.result && !state.result.ok && <span role="alert" className={cn('text-[0.8125rem] text-signal-700')}>{state.result.detail}</span>}
    </form>
  );
}
