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
    <form onSubmit={onSubmit} noValidate>
      {/* What it's about: the request types as tabs across the top of the card */}
      <div role="radiogroup" aria-label="What do you need?" className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
        {requestTypes.map((t) => (
          <label key={t.id} className="group flex cursor-pointer flex-col items-center justify-center gap-2 bg-canvas px-3 py-5 text-center text-[0.9375rem] font-medium text-ink-3 transition hover:bg-paper hover:text-ink has-[:checked]:bg-paper has-[:checked]:text-brand-700 has-[:checked]:shadow-[inset_0_-3px_0_var(--color-brand-600)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand-500/25">
            <input type="radio" name="type" value={t.id} defaultChecked={t.id === 'fault'} className="sr-only" />
            <Icon name={typeIcons[t.id]} className="text-2xl group-has-[:checked]:text-brand-600" />
            <span className="leading-tight">{t.label}</span>
          </label>
        ))}
      </div>
      {errors.type && <span role="alert" className="block px-6 pt-3 text-xs text-signal-700 md:px-9">{errors.type}</span>}

      <div className="grid gap-5 p-6 md:grid-cols-2 md:p-9">
        <Field label="Equipment" error={errors.equipment}>
          <input name="equipment" placeholder="e.g. Mindray BC-5150" aria-invalid={!!errors.equipment} className={field} />
        </Field>
        <Field label="Hospital or lab" error={errors.facility}>
          <input name="facility" autoComplete="organization" aria-invalid={!!errors.facility} className={field} />
        </Field>
        <div className="md:col-span-2">
          <Field label="What is happening?" error={errors.message}>
            <textarea name="message" rows={4} placeholder="Describe the fault or what you need: error codes, when it started, what you have tried." aria-invalid={!!errors.message} className={cn(field, 'h-auto resize-none py-3')} />
          </Field>
        </div>
        <Field label="Your name" error={errors.name}>
          <input name="name" autoComplete="name" aria-invalid={!!errors.name} className={field} />
        </Field>
        <Field label="Phone (we’ll call you back)" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
        </Field>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex flex-col gap-4 bg-brand-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-9">
        <p className="flex items-center gap-3 text-[0.9375rem] text-ink-2">
          <Icon name="fi-rr-phone-call" className="text-lg text-brand-600" />
          <span>Equipment down right now? Call <a href={contact.phoneHref} className="font-semibold text-ink hover:text-brand-700">{contact.phone}</a>, 24/7.</span>
        </p>
        <button type="submit" disabled={pending} className={cn(button, 'w-full sm:w-auto')}>
          {pending ? 'Sending…' : <>Send request <Icon name="fi-rr-arrow-small-right" /></>}
        </button>
      </div>
    </form>
  );
}

const typeIcons: Record<SupportInput['type'], string> = {
  fault: 'fi-rr-exclamation',
  maintenance: 'fi-rr-calendar',
  installation: 'fi-rr-settings',
  assistance: 'fi-rr-headset',
};

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
    <div className="p-6 md:p-9">
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
