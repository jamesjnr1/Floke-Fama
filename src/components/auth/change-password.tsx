'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { changePassword, type PasswordState } from '@/lib/auth/actions';
import { LogoMark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';

const field = 'h-12 w-full border border-line bg-paper px-4 text-base text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';

/**
 * Change password, the same page for every account: the current password, the new one twice. `area` is 'admin' in
 * the admin console (its own session); `back` is where the person came from.
 */
export function ChangePassword({ email, back, backLabel, area }: { email: string; back: string; backLabel: string; area?: 'admin' }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const e = state.errors ?? {};
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center bg-[#eef2f0] px-5 py-12">
      <div className="w-full max-w-[440px]">
        <Link href={back} className="mb-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-3 hover:text-ink">
          <Icon name="fi-rr-arrow-small-left" /> {backLabel}
        </Link>
        <div className="bg-white p-7 shadow-[0_30px_60px_-34px_rgb(11_21_16/0.35)] md:p-10">
          <LogoMark className="size-10" />
          <h1 className="mt-6 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-ink">Change password</h1>
          <p className="mt-2 text-ink-3">For {email}</p>
          {state.done ? (
            <div className="mt-8">
              <p className="flex items-center gap-2 font-semibold text-brand-700">
                <Icon name="fi-rr-check-circle" /> Your password has been changed.
              </p>
              <p className="mt-2 text-ink-3">Use the new password the next time you sign in.</p>
              <Link href={back} className="mt-6 inline-flex h-12 items-center bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800">
                {backLabel}
              </Link>
            </div>
          ) : (
            <form action={action} noValidate className="mt-8 space-y-4">
              {area && <input type="hidden" name="area" value={area} />}
              <input type="hidden" name="username" value={email} autoComplete="username" readOnly />
              <Field label="Current password" error={e.current}>
                <input name="current" type="password" autoComplete="current-password" aria-invalid={!!e.current} className={field} />
              </Field>
              <Field label="New password" hint="At least 8 characters" error={e.password}>
                <input name="password" type="password" autoComplete="new-password" aria-invalid={!!e.password} className={field} />
              </Field>
              <Field label="Confirm new password" error={e.confirm}>
                <input name="confirm" type="password" autoComplete="new-password" aria-invalid={!!e.confirm} className={field} />
              </Field>
              {e.form && <p role="alert" className="text-sm text-signal-700">{e.form}</p>}
              <button disabled={pending} className="h-12 w-full bg-brand-700 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
                {pending ? 'Saving…' : 'Change password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink-2">
        {label}
        {hint && <span className="font-normal text-ink-3"> · {hint}</span>}
      </span>
      {children}
      {error && <span role="alert" className="text-xs text-signal-700">{error}</span>}
    </label>
  );
}
