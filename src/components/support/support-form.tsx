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
  'h-12 w-full border border-line bg-paper px-4 text-base text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';
const button = 'inline-flex h-12 items-center justify-center gap-2 bg-cta px-6 text-base font-semibold text-white transition hover:bg-cta-700 disabled:opacity-60';
const back = 'inline-flex h-12 items-center gap-2 border border-line px-5 text-base font-semibold text-ink transition hover:border-ink/30';

/** The form in three stages, each checked before the next opens. */
const steps = [
  { title: 'What do you need?', fields: ['type'] },
  { title: 'Tell us about the equipment', fields: ['equipment', 'message'] },
  { title: 'Your details', fields: ['name', 'facility', 'phone'] },
] as const satisfies { title: string; fields: (keyof SupportInput)[] }[];

const empty: SupportInput = { type: 'fault', name: '', facility: '', phone: '', equipment: '', message: '', website: '' };

/**
 * Request technical assistance or report a fault, in three stages: the kind of request, the equipment and what is
 * wrong, then the contact details. Delivered to the CRM when it is connected; otherwise the visitor sends the same
 * request, pre-filled, to the support inbox by email or on WhatsApp.
 */
export function SupportForm() {
  const { contact } = useSite();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SupportInput>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const set = (k: keyof SupportInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  /** Checks the fields of the current stage only; true when they are all right. */
  function check() {
    const parsed = supportSchema.safeParse(values);
    const next: Errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof SupportInput;
        if ((steps[step].fields as readonly string[]).includes(k)) next[k] ??= issue.message;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!check()) return;
    if (step < steps.length - 1) return setStep(step + 1);
    const parsed = supportSchema.safeParse(values);
    if (!parsed.success) return;
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

  if (result)
    return (
      <Sent
        {...result}
        onReset={() => {
          setResult(null);
          setValues(empty);
          setStep(0);
        }}
      />
    );

  const last = step === steps.length - 1;
  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Where the visitor is: three bars, the done and current ones filled */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-ink-3">
          Step {step + 1} of {steps.length}
        </p>
        <ol className="grid w-40 grid-cols-3 gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <li key={s.title} className={cn('h-1.5 transition-colors', i <= step ? 'bg-brand-600' : 'bg-line')} />
          ))}
        </ol>
      </div>
      <p className="mt-3 text-xl font-bold tracking-[-0.01em] text-ink">{steps[step].title}</p>

      <div className="mt-5 space-y-4">
        {step === 0 && (
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Request</legend>
            {requestTypes.map((t) => (
              <label
                key={t.id}
                className={cn(
                  'flex h-14 cursor-pointer items-center gap-3 border px-4 text-base font-semibold transition',
                  values.type === t.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line bg-paper text-ink hover:border-ink/30',
                )}
              >
                <input type="radio" name="type" value={t.id} checked={values.type === t.id} onChange={set('type')} className="size-4 accent-[#007a4d]" />
                {t.label}
              </label>
            ))}
          </fieldset>
        )}

        {step === 1 && (
          <>
            <Field label="Equipment" error={errors.equipment}>
              <input name="equipment" value={values.equipment} onChange={set('equipment')} placeholder="e.g. Mindray BC-5150" aria-invalid={!!errors.equipment} className={field} autoFocus />
            </Field>
            <Field label={values.type === 'fault' ? 'What is wrong?' : 'What do you need?'} error={errors.message}>
              <textarea name="message" value={values.message} onChange={set('message')} rows={4} placeholder="Describe the fault or what you need." aria-invalid={!!errors.message} className={cn(field, 'h-auto resize-none py-3')} />
            </Field>
          </>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Your name" error={errors.name}>
              <input name="name" value={values.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} className={field} autoFocus />
            </Field>
            <Field label="Hospital or lab" error={errors.facility}>
              <input name="facility" value={values.facility} onChange={set('facility')} autoComplete="organization" aria-invalid={!!errors.facility} className={field} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input name="phone" type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
            </Field>
          </div>
        )}
      </div>

      <input name="website" value={values.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && (
          <button type="button" onClick={() => (setErrors({}), setStep(step - 1))} className={back}>
            <Icon name="fi-rr-arrow-small-left" /> Back
          </button>
        )}
        <button type="submit" disabled={pending} className={button}>
          {last ? (pending ? 'Sending…' : 'Send request') : 'Continue'}
          {!last && <Icon name="fi-rr-arrow-small-right" />}
        </button>
      </div>
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
