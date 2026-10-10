'use client';

import { useActionState, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { register, type SignupState } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

const field =
  'h-12 w-full rounded-xl border border-line bg-paper px-4 text-[1.125rem] text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-signal';

/** Create a hospital account: signs the facility in straight away and opens its dashboard (or where they were going, e.g. checkout). */
export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(register, {});
  const [show, setShow] = useState(false);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  const row = (name: keyof NonNullable<SignupState['errors']>, label: string, input: React.ReactNode) => (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      {input}
      {e[name] && <span className="text-sm text-signal-700">{e[name]}</span>}
    </label>
  );

  return (
    <form action={action} noValidate className="mt-8 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {row('name', 'Your name (contact person)', <input name="name" autoComplete="name" defaultValue={v.name} aria-invalid={!!e.name} className={field} />)}
      {row('organisation', 'Hospital or facility name', <input name="organisation" autoComplete="organization" defaultValue={v.organisation} aria-invalid={!!e.organisation} placeholder="e.g. Korle-Bu Teaching Hospital" className={field} />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {row('phone', 'Phone', <input name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} aria-invalid={!!e.phone} placeholder="+233" className={field} />)}
        {row('email', 'Email', <input name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!e.email} placeholder="you@hospital.org" className={field} />)}
      </div>
      {row(
        'password',
        'Password',
        <span className="relative">
          <input name="password" type={show ? 'text' : 'password'} autoComplete="new-password" aria-invalid={!!e.password} placeholder="At least 8 characters" className={cn(field, 'pr-12')} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-3 hover:bg-mist">
            <Icon name={show ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} />
          </button>
        </span>,
      )}
      {row('confirm', 'Confirm password', <input name="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" aria-invalid={!!e.confirm} className={field} />)}
      <label className="flex items-center gap-2.5 text-sm text-ink-2">
        <input type="checkbox" name="keep" className="size-4 accent-[#007a4d]" /> Keep me signed in
      </label>
      <button type="submit" disabled={pending} className="!mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[1.125rem] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
        {pending ? 'Creating your hospital account…' : 'Create hospital account'}
      </button>
      <p className="text-center text-sm text-ink-3">Hospitals, clinics and laboratories. Add your equipment once you’re in, and request service from your dashboard.</p>
    </form>
  );
}
