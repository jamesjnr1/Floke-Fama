'use client';

import { useActionState, useState } from 'react';
import { sendToHospitals, type HospitalTextState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** Plain characters, as the text will be sent (curly quotes and dashes would make phones count 70 a part). */
const plain = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '');
const parts = (n: number) => (n <= 160 ? 1 : Math.ceil(n / 153));

/**
 * Admin console → Text messages: write (or pick) a message and send it to every hospital that gets texts, after
 * seeing how many hospitals and SMS it will take.
 */
export function HospitalTextsForm({ templates, hospitals }: { templates: { id: string; label: string; text: string }[]; hospitals: number }) {
  const [state, action, pending] = useActionState<HospitalTextState, FormData>(sendToHospitals, {});
  const [text, setText] = useState(templates[0]?.text ?? '');
  const [picked, setPicked] = useState(templates[0]?.id ?? '');
  const length = plain(text).length;
  return (
    <form action={action} className="rounded-[1.25rem] bg-white p-5 shadow-[0_1px_2px_rgb(16_25_30/0.04)] md:p-6">
      <h3 className="text-lg font-semibold">Send to hospitals</h3>
      <p className="mt-1 text-[0.9375rem] text-ink-3">New arrivals, a holiday not greeted automatically, or any news. Pick a message, change it if you like, and send.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Message">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={picked === t.id}
            onClick={() => {
              setPicked(t.id);
              setText(t.text);
            }}
            className={cn('h-9 rounded-lg border px-3 text-[0.875rem] font-medium transition', picked === t.id ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white hover:border-brand-600')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Message</span>
        <textarea name="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={459} rows={4} placeholder="Write the message…" className="w-full resize-none rounded-xl border border-line px-3.5 py-3 text-[0.9375rem] leading-snug outline-none focus:border-brand-600" />
      </label>
      <p className="mt-1 text-[0.8125rem] text-ink-3">
        {length} characters · {parts(length)} SMS per hospital · sent from “Flokefama”
      </p>
      <label className="mt-4 flex items-start gap-2.5 text-[0.9375rem]">
        <input type="checkbox" name="confirm" className="mt-1 size-4 accent-[#0b6b45]" />
        <span>
          Send to <b>{hospitals}</b> hospital{hospitals === 1 ? '' : 's'} (about {hospitals * parts(length)} SMS). Hospitals that turned texts off in their portal are left out.
        </span>
      </label>
      <button disabled={pending || length < 10 || !hospitals} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
        <Icon name="fi-rr-paper-plane" /> {pending ? 'Sending…' : 'Send to hospitals'}
      </button>
      {state.result && (
        <p role="status" className={cn('mt-3 flex items-start gap-2 text-[0.9375rem]', state.result.ok ? 'text-brand-700' : 'text-signal-700')}>
          <Icon name={state.result.ok ? 'fi-rr-check-circle' : 'fi-rr-exclamation'} className="mt-0.5" /> {state.result.detail}
        </p>
      )}
    </form>
  );
}
