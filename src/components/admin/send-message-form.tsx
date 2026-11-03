'use client';

import { useActionState, useEffect, useState } from 'react';
import { sendMessage, type MessageState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const MAX = 459;
/** How many texts a message makes: one up to 160 characters, then 153 each (the split takes a few). */
const parts = (n: number) => (n <= 160 ? 1 : Math.ceil(n / 153));

/**
 * Admin console → Text messages: a message written by hand (an introduction, a notice), from "Flokefama", to up to 5
 * numbers. Line breaks are kept, so a name can go on its own line. A link from elsewhere in the console can fill it in
 * (?to=…&message=…); nothing is sent until Send is pressed.
 */
export function SendMessageForm({ defaultTo, defaultMessage }: { defaultTo?: string; defaultMessage?: string }) {
  const [state, action, pending] = useActionState<MessageState, FormData>(sendMessage, {});
  const [to, setTo] = useState(defaultTo ?? '');
  const [text, setText] = useState(defaultMessage ?? '');
  // Sent: empty the box, so the same message can't go out twice by accident
  useEffect(() => {
    if (state.result?.ok) {
      setTo('');
      setText('');
    }
  }, [state]);
  const count = text.length;
  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-5">
      <p className="font-semibold">Send a message</p>
      <p className="mt-0.5 text-[0.875rem] text-ink-3">From “Flokefama”, to up to 5 numbers (separate them with commas). Line breaks are kept.</p>
      <label htmlFor="msg-to" className="mt-4 block text-[0.875rem] font-medium">To</label>
      <input id="msg-to" name="to" type="tel" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. 024 123 4567" className="mt-1.5 h-11 w-full max-w-md rounded-xl border border-line bg-white px-3.5 text-[0.9375rem] outline-none focus:border-brand-600" />
      <label htmlFor="msg-text" className="mt-3 block text-[0.875rem] font-medium">Message</label>
      <textarea
        id="msg-text"
        name="message"
        required
        rows={6}
        maxLength={MAX}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-1.5 block w-full max-w-2xl rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] leading-relaxed outline-none focus:border-brand-600"
      />
      <p className="mt-1 text-[0.8125rem] text-ink-3">
        {count} of {MAX} characters · {parts(count)} text{parts(count) === 1 ? '' : 's'} per number
      </p>
      <button disabled={pending || !count} className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
        <Icon name="fi-rr-paper-plane" /> {pending ? 'Sending…' : 'Send'}
      </button>
      {state.result && (
        <p role="status" className={cn('mt-2 flex items-start gap-2 text-[0.875rem]', state.result.ok ? 'text-brand-700' : 'text-signal-700')}>
          <Icon name={state.result.ok ? 'fi-rr-check-circle' : 'fi-rr-exclamation'} className="mt-0.5" /> {state.result.detail}
        </p>
      )}
    </form>
  );
}
