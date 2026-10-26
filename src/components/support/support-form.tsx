'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { composeLinks } from '@/lib/compose';
import { assistanceTopics, requestTypes, supportSchema, supportSummary, workingStates, type SupportInput } from '@/lib/support-schema';
import { cn } from '@/lib/utils';

type Errors = Partial<Record<keyof SupportInput, string>>;
type Result = { delivered: boolean; data: SupportInput; reference?: string } | null;

const field =
  'h-12 w-full rounded-lg border border-line bg-paper px-4 text-base text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';
const button = 'inline-flex h-12 items-center justify-center gap-2 bg-cta px-6 text-base font-semibold text-white transition hover:bg-cta-700 disabled:opacity-60';

/**
 * Request technical assistance or report a fault. Each tab asks for what that request needs (see supportSchema);
 * the hospital, name and phone are asked every time. Saved for the engineers, emailed to the support inbox, and if
 * neither works the visitor sends the same request, pre-filled, by email or on WhatsApp.
 */
export function SupportForm() {
  const { contact } = useSite();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [type, setType] = useState<SupportInput['type']>('fault');

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
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; reference?: string; error?: string };
      if (!res.ok) throw new Error(json.error);
      setResult({ delivered: json.delivered === true, data: parsed.data, reference: json.reference });
      if (json.delivered) toast.success('Request sent', { description: 'Our support team will contact you shortly.' });
    } catch (error) {
      toast.error('We couldn’t send your request', { description: (error as Error).message || `Please call ${contact.phone}.` });
    } finally {
      setPending(false);
    }
  }

  if (result) return <Sent {...result} onReset={() => setResult(null)} />;

  const today = new Date().toISOString().slice(0, 10);
  const notes = (label: string, placeholder: string, required: boolean) => (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}{!required && <span className="font-normal text-ink-3"> (optional)</span>}</span>
      <textarea name="message" rows={4} placeholder={placeholder} aria-invalid={!!errors.message} className={cn(field, 'h-auto min-h-[7.5rem] flex-1 resize-none py-3')} />
      {errors.message && <span role="alert" className="text-xs text-signal-700">{errors.message}</span>}
    </label>
  );
  const equipment = (placeholder: string, optional = false) => (
    <Field label="Equipment" optional={optional} error={errors.equipment}>
      <input name="equipment" placeholder={placeholder} aria-invalid={!!errors.equipment} className={field} />
    </Field>
  );
  const preferred = (
    <Field label="Preferred date" optional error={errors.preferredDate}>
      <input name="preferredDate" type="date" min={today} aria-invalid={!!errors.preferredDate} className={field} />
    </Field>
  );

  return (
    <form
      onSubmit={onSubmit}
      // A message goes as soon as its field is changed
      onChange={(e) => {
        const name = (e.target as unknown as HTMLInputElement).name as keyof SupportInput;
        if (errors[name]) setErrors((all) => ({ ...all, [name]: undefined }));
      }}
      noValidate
      className="flex h-full flex-col"
    >
      {/* What it's about: the request types as tabs across the top of the card */}
      <div role="radiogroup" aria-label="What do you need?" className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
        {requestTypes.map((t) => (
          <label key={t.id} className="group flex cursor-pointer flex-col items-center justify-center gap-2 bg-canvas px-3 py-5 text-center text-[0.9375rem] font-medium text-ink-3 transition hover:bg-paper hover:text-ink has-[:checked]:bg-paper has-[:checked]:text-brand-700 has-[:checked]:shadow-[inset_0_-3px_0_var(--color-brand-600)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-brand-500/25">
            <input
              type="radio"
              name="type"
              value={t.id}
              checked={type === t.id}
              onChange={() => {
                setType(t.id);
                setErrors({});
              }}
              className="sr-only"
            />
            <Icon name={typeIcons[t.id]} className="text-2xl group-has-[:checked]:text-brand-600" />
            <span className="leading-tight">{t.label}</span>
          </label>
        ))}
      </div>

      {/* The questions for this tab, then who to call back. key: a fresh set of fields for each tab */}
      <div key={type} className="flex flex-1 flex-col gap-5 p-6 md:p-9">
        {type === 'fault' && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {equipment('e.g. Mindray BC-5150 analyser')}
              <Field label="Serial number" optional error={errors.serial}>
                <input name="serial" placeholder="On the label at the back" className={field} />
              </Field>
            </div>
            <Choices name="working" label="Is it still working?" options={workingStates} error={errors.working} />
            {notes('What is happening?', 'Error codes, when it started, what you have tried.', true)}
          </>
        )}
        {type === 'maintenance' && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {equipment('e.g. Patient monitors in the ICU')}
              <Field label="How many units" optional error={errors.units}>
                <input name="units" inputMode="numeric" placeholder="e.g. 6" aria-invalid={!!errors.units} className={field} />
              </Field>
              <Field label="Last serviced" optional error={errors.lastService}>
                <input name="lastService" type="date" max={today} aria-invalid={!!errors.lastService} className={field} />
              </Field>
              {preferred}
            </div>
            {notes('Anything we should know?', 'e.g. Calibration certificates are due for renewal.', false)}
          </>
        )}
        {type === 'installation' && (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {equipment('e.g. Autoclave 35L')}
              <Field label="Order or invoice number" optional error={errors.order}>
                <input name="order" placeholder="e.g. FF-5A3F1" className={field} />
              </Field>
              <Field label="Where will it be installed?" error={errors.location}>
                <input name="location" placeholder="e.g. Main theatre, 2nd floor" aria-invalid={!!errors.location} className={field} />
              </Field>
              {preferred}
            </div>
            {notes('Anything we should know?', 'e.g. Delivered last week; power and water points are ready.', false)}
          </>
        )}
        {type === 'assistance' && (
          <>
            <Choices name="topic" label="What do you need help with?" options={assistanceTopics} error={errors.topic} />
            {equipment('If it is about a particular machine', true)}
            {notes('Tell us more', 'What do you need, and for whom?', true)}
          </>
        )}

        <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-3">
          <Field label="Hospital or lab" error={errors.facility}>
            <input name="facility" autoComplete="organization" aria-invalid={!!errors.facility} className={field} />
          </Field>
          <Field label="Your name" error={errors.name}>
            <input name="name" autoComplete="name" aria-invalid={!!errors.name} className={field} />
          </Field>
          <Field label="Phone (we’ll call you back)" error={errors.phone}>
            <input name="phone" type="tel" autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
          </Field>
        </div>
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

/** A question answered by picking one of a few square choices. */
function Choices({ name, label, options, error }: { name: string; label: string; options: readonly { id: string; label: string }[]; error?: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-2">{label}</legend>
      <div className={cn('mt-1.5 grid gap-2.5', options.length > 2 ? 'grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2')}>
        {options.map((o) => (
          <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-paper px-4 py-2.5 text-[0.9375rem] text-ink-2 transition hover:border-brand-500 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:font-medium has-[:checked]:text-brand-700 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-500/20">
            <input type="radio" name={name} value={o.id} className="size-4 shrink-0 accent-[#007a4d]" />
            {o.label}
          </label>
        ))}
      </div>
      {error && <span role="alert" className="mt-1.5 block text-xs text-signal-700">{error}</span>}
    </fieldset>
  );
}

const typeIcons: Record<SupportInput['type'], string> = {
  fault: 'fi-rr-exclamation',
  maintenance: 'fi-rr-calendar',
  installation: 'fi-rr-settings',
  assistance: 'fi-rr-headset',
};

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}{optional && <span className="font-normal text-ink-3"> (optional)</span>}</span>
      {children}
      {error && <span role="alert" className="text-xs text-signal-700">{error}</span>}
    </label>
  );
}

function Sent({ delivered, data, reference, onReset }: NonNullable<Result> & { onReset: () => void }) {
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
          {reference && <p className="mt-3 text-ink-2">Your reference: <span className="font-mono font-semibold text-ink">{reference}</span></p>}
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
