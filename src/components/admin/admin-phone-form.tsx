'use client';

import { useActionState, useState } from 'react';
import { setAdminPhone, type AdminPhoneState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';

/**
 * Admin console → Admins: an admin's phone number for the admins' texts (a new engineer joining, urgent jobs nobody
 * has taken). Shows the number, or a warning when there is none, with Edit. Once saved, the page redraws with the
 * new number, and the `key` the console gives this form closes it.
 */
export function AdminPhoneForm({ id, phone }: { id: string; phone: string }) {
  const [state, action, pending] = useActionState<AdminPhoneState, FormData>(setAdminPhone, {});
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <span className="flex flex-wrap items-center gap-2 text-[0.875rem]">
        {phone ? (
          <span className="inline-flex items-center gap-1.5 text-ink-2"><Icon name="fi-rr-phone-call" className="text-ink-3" /> {phone}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-medium text-signal-700"><Icon name="fi-rr-exclamation" /> No phone: gets no texts</span>
        )}
        <button type="button" onClick={() => setEditing(true)} className="font-medium text-brand-700 hover:underline">
          {phone ? 'Change' : 'Add phone'}
        </button>
      </span>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="id" value={id} />
      <span className="flex items-center gap-2">
        <input name="phone" type="tel" defaultValue={phone} placeholder="024 123 4567" autoFocus aria-label="Phone number" aria-invalid={!!state.error} className="h-10 w-44 rounded-xl border border-line bg-white px-3 text-[0.9375rem] outline-none focus:border-brand-600 aria-[invalid=true]:border-signal" />
        <button disabled={pending} className="inline-flex h-10 items-center rounded-xl bg-brand-700 px-4 text-[0.875rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => setEditing(false)} className="text-[0.875rem] font-medium text-ink-3 hover:text-ink">Cancel</button>
      </span>
      {state.error && !pending && <span role="alert" className="text-[0.8125rem] text-signal-700">{state.error}</span>}
    </form>
  );
}
