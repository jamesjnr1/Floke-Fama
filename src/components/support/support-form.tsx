'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { composeLinks } from '@/lib/compose';
import { requestTypes, supportSchema, supportSummary, type SupportInput } from '@/lib/support-schema';
import { cn } from '@/lib/utils';

type Errors = Partial<Record<keyof SupportInput, string>>;
type Result = { delivered: boolean; data: SupportInput } | null;

const field =
  'h-12 w-full rounded-lg border border-line bg-paper px-4 text-base text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';
const button = 'inline-flex h-12 items-center justify-center gap-2 bg-cta px-6 text-base font-semibold text-white transition hover:bg-cta-700 disabled:opacity-60';

/**
 * Request technical assistance or report a fault. Delivered to the CRM when it is connected; otherwise the visitor
 * sends the same request, pre-filled, to the support inbox by email or on WhatsApp.
 */
export function SupportForm() {
  const { contact } = useSite();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = supportSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof SupportInput] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error);
      setResult({ delivered: json.delivered === true, data: parsed.data });
      if (json.delivered) toast.success('Request sent', { description: 'Our support team will contact you shortly.' });
    } catch (error) {
      toast.error('We couldn’t send your request', { description: (error as Error).message || `Please call ${contact.phone}.` });
    } finally {
      setPending(false);
    }
  }

  if (result) return <Sent {...result} onReset={() => setResult(null)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Request" error={errors.type}>
          <select name="type" defaultValue="fault" className={field}>
            {requestTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Equipment" error={errors.equipment}>
          <input name="equipment" placeholder="e.g. Mindray BC-5150" aria-invalid={!!errors.equipment} className={field} />
        </Field>
      </div>
      <Field label="What do you need?" error={errors.message}>
        <textarea name="message" rows={3} placeholder="Describe the fault or what you need." aria-invalid={!!errors.message} className={cn(field, 'h-auto resize-none py-3')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name" error={errors.name}>
          <input name="name" autoComplete="name" aria-invalid={!!errors.name} className={field} />
        </Field>
        <Field label="Hospital or lab" error={errors.facility}>
          <input name="facility" autoComplete="organization" aria-invalid={!!errors.facility} className={field} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
        </Field>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button type="submit" disabled={pending} className={cn(button, 'w-full sm:w-auto')}>
        {pending ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      {children}
      {error && <span role="alert" className="text-xs text-signal-700">{error}</span>}
    </label>
  );
}

function Sent({ delivered, data, onReset }: NonNullable<Result> & { onReset: () => void }) {
  const { contact } = useSite();
  const send = composeLinks({
    whatsapp: contact.whatsapp,
    to: contact.support,
    subject: `Technical support: ${data.facility}`,
    body: [supportSummary(data), '', data.name, data.phone].join('\n'),
  });
  return (
    <div className="py-4">
      <span className="grid size-12 place-items-center bg-brand-600 text-xl text-white">
        <Icon name={delivered ? 'fi-rr-check' : 'fi-rr-paper-plane'} />
      </span>
      {delivered ? (
        <>
          <p className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">Request sent.</p>
          <p className="mt-2 text-ink-3">Thank you, {data.name.split(' ')[0]}. Our support team will contact you on {data.phone}.</p>
        </>
      ) : (
        <>
          <p className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">One last step.</p>
          <p className="mt-2 text-ink-3">Your request is ready. Send it to {contact.support} by email or on WhatsApp. Everything is filled in.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={send.email} className={button}><Icon name="fi-rr-envelope" /> Send by email</a>
            <a href={send.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 border border-line px-5 text-base font-semibold text-ink transition hover:border-ink/30">
              <Icon name="fi-brands-whatsapp" /> Send on WhatsApp
            </a>
          </div>
        </>
      )}
      <button type="button" onClick={onReset} className="mt-5 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
        Send another request
      </button>
    </div>
  );
}
