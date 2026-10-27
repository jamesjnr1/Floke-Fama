'use client';

import { useActionState } from 'react';
import { testSms, type TestSmsState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** Admin console → Database & settings: send one real text to check the gateway, the key and the sender ID. */
export function TestSmsForm({ defaultPhone }: { defaultPhone?: string }) {
  const [state, action, pending] = useActionState<TestSmsState, FormData>(testSms, {});
  return (
    <form action={action} className="mt-3 rounded-xl border border-line bg-[#fafcfb] p-4">
      <label htmlFor="test-sms-phone" className="text-[0.875rem] font-medium">Send a test text</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input id="test-sms-phone" name="phone" type="tel" required defaultValue={state.phone ?? defaultPhone} placeholder="e.g. 024 123 4567" className="h-11 w-56 rounded-xl border border-line bg-white px-3.5 text-[0.9375rem] outline-none focus:border-brand-600" />
        <button disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
          <Icon name="fi-rr-paper-plane" /> {pending ? 'Sending…' : 'Send'}
        </button>
      </div>
      {state.result && (
        <p role="status" className={cn('mt-2 flex items-start gap-2 text-[0.875rem]', state.result.ok ? 'text-brand-700' : 'text-signal-700')}>
          <Icon name={state.result.ok ? 'fi-rr-check-circle' : 'fi-rr-exclamation'} className="mt-0.5" /> {state.result.detail}
        </p>
      )}
    </form>
  );
}
