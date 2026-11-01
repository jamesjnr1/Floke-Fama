'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { joinAsEngineer, type JoinState } from '@/lib/engineer-actions';
import { regions } from '@/lib/regions';
import { cn } from '@/lib/utils';

const field = 'h-14 w-full rounded-xl border border-line bg-white px-4 text-[1.0625rem] text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';

/** The engineer's registration: five fields, big enough to fill in on a phone in the field. */
export function JoinForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinAsEngineer, {});
  const [show, setShow] = useState(false);
  const e = state.errors ?? {};
  const v = state.values ?? {};

  if (state.done)
    return (
      <div role="status" className="mt-6 rounded-xl bg-brand-50 p-5 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-600 text-2xl text-white"><Icon name="fi-rr-check" /></span>
        <p className="mt-4 text-[1.25rem] font-bold text-ink">Thank you, {state.done.name.split(' ')[0]}!</p>
        <p className="mt-2 text-[1.0625rem] text-ink-2">Your registration is with your manager. You will get a text as soon as it is approved, then sign in with your email and password.</p>
        <Link href="/engineer/login" className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800">Go to the sign-in page</Link>
      </div>
    );

  const err = (k: keyof NonNullable<JoinState['errors']>) => e[k] && <span role="alert" className="text-sm text-signal-700">{e[k]}</span>;
  return (
    <form action={action} noValidate className="mt-6 space-y-4">
      <input type="hidden" name="code" value={code} />
      {/* Left empty by people; bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="grid gap-1.5">
        <span className="font-medium text-ink-2">Full name</span>
        <input name="name" autoComplete="name" defaultValue={v.name} placeholder="e.g. Kwame Agyemang" aria-invalid={!!e.name} className={field} />
        {err('name')}
      </label>
      <label className="grid gap-1.5">
        <span className="font-medium text-ink-2">Phone number</span>
        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone} placeholder="e.g. 024 123 4567" aria-invalid={!!e.phone} className={field} />
        <span className="text-sm text-ink-3">Your job texts come to this number, and hospitals see it on your jobs.</span>
        {err('phone')}
      </label>
      <label className="grid gap-1.5">
        <span className="font-medium text-ink-2">Email</span>
        <input name="email" type="email" autoComplete="email" inputMode="email" defaultValue={v.email} placeholder="you@example.com" aria-invalid={!!e.email} className={field} />
        {err('email')}
      </label>
      <label className="grid gap-1.5">
        <span className="font-medium text-ink-2">Your region</span>
        <select key={v.region ?? ''} name="region" defaultValue={v.region ?? ''} aria-invalid={!!e.region} className={cn(field, 'pr-10')}>
          <option value="" disabled>Choose where you work</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-sm text-ink-3">Urgent jobs in your region come to you first.</span>
        {err('region')}
      </label>
      <label className="grid gap-1.5">
        <span className="font-medium text-ink-2">Choose a password</span>
        <span className="relative">
          <input name="password" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={!!e.password} className={cn(field, 'pr-20')} />
          <button type="button" onClick={() => setShow((x) => !x)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">{show ? 'Hide' : 'Show'}</button>
        </span>
        {err('password')}
      </label>
      {e.form && <p role="alert" className="rounded-xl bg-[#fdecec] p-3 text-signal-700">{e.form}</p>}
      <button disabled={pending} className="h-14 w-full rounded-xl bg-brand-700 text-[1.0625rem] font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
        {pending ? 'Sending…' : 'Register'}
      </button>
      <p className="text-center text-sm text-ink-3">Already registered? <Link href="/engineer/login" className="font-semibold text-brand-700 hover:underline">Sign in</Link></p>
    </form>
  );
}
