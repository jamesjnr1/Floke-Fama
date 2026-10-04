'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { composeLinks } from '@/lib/compose';
import { contactSchema, topics, type ContactInput } from '@/lib/contact-schema';
import { cn } from '@/lib/utils';

type Errors = Partial<Record<keyof ContactInput, string>>;
type Result = { delivered: boolean; data: ContactInput } | null;

const field =
  'h-12 w-full rounded-xl border border-line bg-paper px-4 text-[0.9375rem] text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';

/**
 * A simple message form. Delivered to the CRM when it is connected; otherwise the visitor sends
 * the same message, pre-filled, by email (to the inbox for the chosen topic) or WhatsApp.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof ContactInput] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error);
      setResult({ delivered: json.delivered === true, data: parsed.data });
      if (json.delivered) toast.success('Message sent', { description: 'Our team will get back to you shortly.' });
    } catch (error) {
      toast.error('We couldn’t send your message', { description: (error as Error).message || `Please call ${contact.phone}.` });
    } finally {
      setPending(false);
    }
  }

  if (result) return <Sent {...result} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>
          <input name="name" autoComplete="name" aria-invalid={!!errors.name} className={field} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
        </Field>
        <Field label="Email (optional)" error={errors.email}>
          <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={field} />
        </Field>
        <Field label="Topic">
          <select name="topic" defaultValue="sales" className={field}>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Message" error={errors.message}>
        <textarea name="message" rows={4} placeholder="How can we help?" aria-invalid={!!errors.message} className={cn(field, 'h-auto resize-none py-3')} />
      </Field>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cta px-6 text-[0.9375rem] font-medium text-white transition hover:bg-cta-700 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-signal-700">{error}</span>
      )}
    </label>
  );
}

function Sent({ delivered, data, onReset }: NonNullable<Result> & { onReset: () => void }) {
  const t = topics.find((x) => x.id === data.topic)!;
  const send = composeLinks({
    to: t.inbox,
    subject: `${t.label}: ${data.name}`,
    body: [data.message, '', data.name, data.phone, data.email].filter(Boolean).join('\n'),
  });
  return (
    <div className="py-4">
      <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-xl text-white">
        <Icon name={delivered ? 'fi-rr-check' : 'fi-rr-paper-plane'} />
      </span>
      {delivered ? (
        <>
          <p className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">Message sent.</p>
          <p className="mt-2 text-ink-3">Thank you, {data.name.split(' ')[0]}. Our team will get back to you shortly.</p>
        </>
      ) : (
        <>
          <p className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">One last step.</p>
          <p className="mt-2 text-ink-3">Your message is ready. Send it by email to {t.inbox} or on WhatsApp. Everything is filled in.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={send.email} className="inline-flex h-12 items-center gap-2 rounded-xl bg-cta px-5 text-[0.9375rem] font-medium text-white transition hover:bg-cta-700">
              <Icon name="fi-rr-envelope" /> Send by email
            </a>
            <a href={send.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl border border-line px-5 text-[0.9375rem] font-medium text-ink transition hover:border-ink/30">
              <Icon name="fi-brands-whatsapp" /> Send on WhatsApp
            </a>
          </div>
        </>
      )}
      <button type="button" onClick={onReset} className="mt-5 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
        Write another message
      </button>
    </div>
  );
}
