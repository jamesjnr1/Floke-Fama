'use client';

import { useActionState, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { login, type LoginState } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

type Demo = { role: 'client' | 'engineer'; label: string; email: string; password: string };

export function LoginForm({ next, demo, notice }: { next?: string; demo: Demo[]; notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const signInWithDemo = (d: Demo) => {
    if (!email.current || !password.current) return;
    email.current.value = d.email;
    password.current.value = d.password;
    form.current?.requestSubmit();
  };

  const field =
    'h-12 w-full rounded-xl border border-line bg-paper px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-100';

  return (
    <div className="mt-8">
      {notice && <p className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 ring-1 ring-brand-100">{notice}</p>}

      <form ref={form} action={action} className="space-y-4" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">Email</span>
          <input ref={email} name="email" type="email" autoComplete="username" required defaultValue={state.email} placeholder="you@hospital.org" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-ink-2">Password</span>
          <span className="relative">
            <input ref={password} name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required placeholder="••••••••" className={cn(field, 'pr-12')} />
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
          className="!mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white shadow-[0_12px_28px_-14px_rgb(37_120_71/0.9)] transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'} {!pending && <Icon name="fi-rr-arrow-small-right" />}
        </button>
      </form>

      {demo.length > 0 && (
        <div className="mt-8">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-ink-3">
            <span className="h-px flex-1 bg-line" aria-hidden /> Demo access · preview only <span className="h-px flex-1 bg-line" aria-hidden />
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {demo.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => signInWithDemo(d)}
                disabled={pending}
                className="rounded-xl border border-dashed border-line px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
              >
                <span className="block text-sm font-medium text-ink">{d.label}</span>
                <span className="block truncate font-mono text-[11px] text-ink-3">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
