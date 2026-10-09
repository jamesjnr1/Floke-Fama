'use client';

import { useActionState, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { login, type LoginState } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const { contact } = useSite();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  const field =
    'h-12 w-full rounded-xl border border-line bg-paper px-4 text-[1.125rem] text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

  return (
    <div className="mt-8">
      {notice && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 ring-1 ring-brand-100">{notice}</p>}

      <form action={action} className="space-y-4" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">Email</span>
          <input name="email" type="email" autoComplete="username" required defaultValue={state.email} placeholder="you@hospital.org" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">Password</span>
          <span className="relative">
            <input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required placeholder="••••••••" className={cn(field, 'pr-12')} />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-3 hover:bg-mist hover:text-ink"
            >
              <Icon name={show ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} />
            </button>
          </span>
        </label>
        <p className="-mt-2 text-right">
          <a
            href={`mailto:${contact.support}?subject=${encodeURIComponent('Client portal: password reset')}&body=${encodeURIComponent('Please reset the password for my client portal account.\n\nEmail on the account: ')}`}
            className="text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
          >
            Forgot password?
          </a>
        </p>

        {state.error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-signal/[0.06] px-4 py-3 text-sm text-signal-700 ring-1 ring-signal/30">
            <span className="size-1.5 shrink-0 rounded-full bg-signal" aria-hidden /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="!mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[1.125rem] font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'} 
        </button>
      </form>

    </div>
  );
}
