'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { addHospitalLogin, registerHospital, type HospitalFormState } from '@/lib/admin/hospital-actions';
import { Icon } from '@/components/ui/icon';

const field = 'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.9375rem] outline-none focus:border-brand-600 aria-[invalid=true]:border-signal';

function Field({ label, error, children, wide }: { label: string; error?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? 'grid gap-1.5 md:col-span-2' : 'grid gap-1.5'}>
      <span className="text-[0.875rem] font-medium text-ink-2">{label}</span>
      {children}
      {error && <span role="alert" className="text-[0.8125rem] text-signal-700">{error}</span>}
    </label>
  );
}

/** The sign-in details to pass on once, with Copy. */
function LoginDone({ name, login }: { name: string; login: { email: string; password: string } }) {
  const [copied, setCopied] = useState(false);
  const details = `Flokefama hospital dashboard (${name})\nSign in: ${location.origin}/login\nEmail: ${login.email}\nPassword: ${login.password}`;
  return (
    <div className="mt-4">
      <p className="text-[0.9375rem] text-ink-3">Pass these sign-in details on. The password is shown only now (they can change it in their dashboard).</p>
      <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-[#f6f8f7] p-4 font-mono text-[0.875rem] text-ink">{details}</pre>
      <button type="button" onClick={() => navigator.clipboard.writeText(details).then(() => setCopied(true))} className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800">
        <Icon name={copied ? 'fi-rr-check' : 'fi-rr-copy'} /> {copied ? 'Copied' : 'Copy details'}
      </button>
    </div>
  );
}

/** Admin console → Hospitals → Register a hospital. */
export function RegisterHospitalForm() {
  const [state, action, pending] = useActionState<HospitalFormState, FormData>(registerHospital, {});
  const e = state.errors ?? {};
  if (state.done)
    return (
      <div>
        <p className="flex items-center gap-2 text-lg font-semibold text-brand-800">
          <Icon name="fi-rr-check-circle" className="text-brand-600" /> {state.done.name} is registered as {state.done.code}.
        </p>
        {state.done.login && <LoginDone name={state.done.name} login={state.done.login} />}
        <div className="mt-4 flex gap-2">
          <Link href={`/admin?tab=hospitals&code=${encodeURIComponent(state.done.code)}`} className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[0.9375rem] font-medium hover:border-ink/30">Open its record</Link>
          <Link href="/admin?tab=hospitals" className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[0.9375rem] font-medium hover:border-ink/30">Done</Link>
        </div>
      </div>
    );
  return (
    <form action={action} noValidate>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Hospital or facility name" error={e.name}>
          <input name="name" defaultValue={state.values?.name} aria-invalid={!!e.name} className={field} />
        </Field>
        <Field label="Contact person (for their login)" error={e.contactName}>
          <input name="contactName" defaultValue={state.values?.contactName} aria-invalid={!!e.contactName} className={field} />
        </Field>
        <Field label="Their email" error={e.email}>
          <input name="email" type="email" defaultValue={state.values?.email} aria-invalid={!!e.email} className={field} />
        </Field>
        <Field label="Their phone" error={e.phone}>
          <input name="phone" type="tel" defaultValue={state.values?.phone} placeholder="+233" aria-invalid={!!e.phone} className={field} />
        </Field>
      </div>
      <p className="mt-3 text-[0.875rem] text-ink-3">The hospital adds its location and other details itself, from its dashboard (Hospital profile).</p>
      <label className="mt-4 flex items-center gap-2 text-[0.9375rem]">
        <input type="checkbox" name="login" defaultChecked={state.values?.login === 'on'} className="size-4 accent-[#007a4d]" /> Also create a login for the contact person (needs their name and email)
      </label>
      {e.form && <p role="alert" className="mt-4 text-[0.9375rem] text-signal-700">{e.form}</p>}
      <div className="mt-5 flex items-center gap-3">
        <button disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
          <Icon name="fi-rr-plus" /> {pending ? 'Registering…' : 'Register hospital'}
        </button>
        <Link href="/admin?tab=hospitals" className="text-[0.9375rem] font-medium text-ink-3 hover:text-ink">Cancel</Link>
      </div>
    </form>
  );
}

/** A hospital's record → Add a login for an authorised person. */
export function AddHospitalLoginForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState<HospitalFormState, FormData>(addHospitalLogin, {});
  const e = state.errors ?? {};
  if (state.done?.login) return <LoginDone name={state.done.name} login={state.done.login} />;
  return (
    <form action={action} noValidate>
      <input type="hidden" name="code" value={code} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Name" error={e.contactName}>
          <input name="contactName" defaultValue={state.values?.contactName} aria-invalid={!!e.contactName} className={field} />
        </Field>
        <Field label="Email" error={e.email}>
          <input name="email" type="email" defaultValue={state.values?.email} aria-invalid={!!e.email} className={field} />
        </Field>
        <Field label="Phone" error={e.phone}>
          <input name="phone" type="tel" defaultValue={state.values?.phone} placeholder="+233" aria-invalid={!!e.phone} className={field} />
        </Field>
      </div>
      {e.form && <p role="alert" className="mt-3 text-[0.9375rem] text-signal-700">{e.form}</p>}
      <button disabled={pending} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
        <Icon name="fi-rr-user-add" /> {pending ? 'Adding…' : 'Add login'}
      </button>
    </form>
  );
}
