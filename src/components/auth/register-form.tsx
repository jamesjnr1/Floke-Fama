'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { composeLinks } from '@/lib/compose';
import { registerSchema, roles, type RegisterInput } from '@/lib/register-schema';
import { cn } from '@/lib/utils';

type Errors = Partial<Record<keyof RegisterInput, string>>;
type Result = { delivered: boolean; data: RegisterInput } | null;

const field =
  'h-12 w-full rounded-xl border border-line bg-paper px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-signal';

/**
 * Client portal registration. Flokefama verifies every facility before an account goes live, so this sends an
 * access request: to the CRM when it is connected, otherwise as a pre-filled email or WhatsApp to support.
 */
export function RegisterForm({ onSignIn }: { onSignIn: () => void }) {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof RegisterInput] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const json = (await res.json().catch(() => ({}))) as { delivered?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error);
      setResult({ delivered: json.delivered === true, data: parsed.data });
    } catch (error) {
      toast.error('We couldn’t send your registration', { description: (error as Error).message || `Please call ${contact.phone}.` });
    } finally {
      setPending(false);
    }
  }

  if (result) return <Requested {...result} onSignIn={onSignIn} />;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
      <Field label="Full name" error={errors.name}>
        <input name="name" autoComplete="name" aria-invalid={!!errors.name} className={field} />
      </Field>
      <Field label="Hospital, lab or clinic" error={errors.facility}>
        <input name="facility" autoComplete="organization" placeholder="e.g. Korle-Bu Teaching Hospital" aria-invalid={!!errors.facility} className={field} />
      </Field>
      <Field label="Your role">
        <select name="role" defaultValue="lab" className={field}>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Work email" error={errors.email}>
          <input name="email" type="email" autoComplete="email" placeholder="you@hospital.org" aria-invalid={!!errors.email} className={field} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" placeholder="+233" aria-invalid={!!errors.phone} className={field} />
        </Field>
      </div>
      <Field label="Installed systems (optional)" error={errors.systems}>
        <textarea name="systems" rows={2} placeholder="e.g. Mindray BC-5150, serial numbers if you have them" className={cn(field, 'h-auto resize-none py-3')} />
      </Field>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button
        type="submit"
        disabled={pending}
        className="!mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white shadow-[0_12px_28px_-14px_rgb(0_112_58/0.9)] transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Create account'} {!pending && <Icon name="fi-rr-arrow-small-right" />}
      </button>
      <p className="text-center text-xs leading-relaxed text-ink-3">
        We verify every facility before an account goes live, then email your sign-in details.
      </p>
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

function Requested({ delivered, data, onSignIn }: NonNullable<Result> & { onSignIn: () => void }) {
  const role = roles.find((r) => r.id === data.role)?.label;
  const send = composeLinks({
    to: contact.support,
    subject: `Client portal registration: ${data.facility}`,
    body: [
      'Please set up a client portal account for me.',
      '',
      `Name: ${data.name}`,
      `Facility: ${data.facility}`,
      `Role: ${role}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      data.systems ? `Installed systems: ${data.systems}` : '',
    ].filter(Boolean).join('\n'),
  });
  return (
    <div className="mt-8 rounded-2xl border border-line bg-canvas p-6" role="status">
      <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-xl text-white">
        <Icon name={delivered ? 'fi-rr-check' : 'fi-rr-paper-plane'} />
      </span>
      {delivered ? (
        <>
          <p className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink">Registration received.</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-3">
            Thank you, {data.name.split(' ')[0]}. We’ll verify {data.facility} and email your sign-in details to {data.email}.
          </p>
        </>
      ) : (
        <>
          <p className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink">One last step.</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-3">
            Your registration is ready. Send it to {contact.support} by email or on WhatsApp. Everything is filled in.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a href={send.email} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-[15px] font-medium text-white transition hover:bg-brand-700">
              <Icon name="fi-rr-envelope" /> Send by email
            </a>
            <a href={send.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-5 text-[15px] font-medium text-ink transition hover:border-ink/30">
              <Icon name="fi-brands-whatsapp" /> WhatsApp
            </a>
          </div>
        </>
      )}
      <button type="button" onClick={onSignIn} className="mt-5 text-sm font-medium text-brand-700 underline-offset-4 hover:underline">
        Back to sign in
      </button>
    </div>
  );
}
