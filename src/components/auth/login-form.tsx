'use client';

import { useActionState, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
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
    'h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-brand-400 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/20';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl md:p-8">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-white">Sign in</h2>
      <p className="mt-1 text-sm text-white/50">Use the account issued by Flokefama.</p>

      {notice && <p className="mt-5 rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-300 ring-1 ring-brand-400/20">{notice}</p>}

      <form ref={form} action={action} className="mt-6 space-y-4" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Email</span>
          <input ref={email} name="email" type="email" autoComplete="username" required defaultValue={state.email} placeholder="you@hospital.org" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">Password</span>
          <span className="relative">
            <input ref={password} name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required className={cn(field, 'pr-12')} />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <Icon name={show ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} />
            </button>
          </span>
        </label>

        {state.error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-signal/10 px-4 py-3 text-sm text-white ring-1 ring-signal/40">
            <span className="size-1.5 shrink-0 rounded-full bg-signal" aria-hidden /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgb(46_154_91/0.8)] transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'} {!pending && <Icon name="fi-rr-arrow-small-right" />}
        </button>
      </form>

      {demo.length > 0 && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">Demo access · preview only</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {demo.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => signInWithDemo(d)}
                disabled={pending}
                className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-left transition hover:border-brand-400/60 hover:bg-white/[0.04] disabled:opacity-60"
              >
                <span className="block text-sm font-medium text-white">{d.label}</span>
                <span className="block truncate font-mono text-[11px] text-white/40">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
