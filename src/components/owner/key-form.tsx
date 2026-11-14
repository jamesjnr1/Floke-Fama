'use client';

import { Lock, Monitor } from 'lucide-react';
import { useActionState, type ReactNode } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { unlock, type UnlockState } from '@/lib/owner/actions';

/** The dashboard's backdrop when it is closed: the deep green of the site, with soft light and rings. */
function Backdrop({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-[linear-gradient(125deg,#04402a_0%,#075056_50%,#16232a_100%)] px-5 py-10">
      <div aria-hidden className="absolute -left-40 -top-48 -z-10 size-[38rem] rounded-full bg-[radial-gradient(circle,rgb(127_209_165/0.30),transparent_65%)]" />
      <div aria-hidden className="absolute -bottom-48 -right-32 -z-10 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(18_168_113/0.26),transparent_65%)]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[62rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
      <div className="w-full max-w-sm">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <LogoMark className="size-10" />
          <LogoWordmark className="h-[18px] text-white" />
        </div>
        {children}
      </div>
    </main>
  );
}

/** The dashboard's door: the manager's key, once per browser every 30 days. */
export function KeyForm({ ready }: { ready: boolean }) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, {});
  return (
    <Backdrop>
      <form action={action} className="rounded-3xl bg-paper p-8 shadow-[0_50px_100px_-40px_rgb(0_0_0/0.7)]">
        <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#12a871] to-[#007a4d] text-white shadow-[0_10px_20px_-10px_rgb(0_122_77/0.8)]"><Lock className="size-5" /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">Site monitor</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3">Private. Enter your key to open the dashboard.</p>
        {ready ? (
          <>
            <label htmlFor="key" className="mt-6 block text-sm font-semibold text-ink-2">Key</label>
            <input id="key" name="key" type="password" required autoFocus autoComplete="current-password" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15" />
            {state.error && <p role="alert" className="mt-3 text-sm font-medium text-signal-700">{state.error}</p>}
            <button type="submit" disabled={pending} className="mt-6 w-full rounded-xl bg-gradient-to-br from-[#12a871] to-[#007a4d] px-4 py-3 font-semibold text-white shadow-[0_14px_28px_-14px_rgb(0_122_77/0.9)] transition hover:brightness-110 disabled:opacity-60">
              {pending ? 'Opening…' : 'Open dashboard'}
            </button>
          </>
        ) : (
          <p className="mt-6 rounded-xl bg-mist p-4 text-sm leading-relaxed text-ink-2">Not switched on yet: add <strong>MONITOR_KEY</strong> (12 or more characters) in Vercel → Settings → Environment Variables, then redeploy.</p>
        )}
      </form>
    </Backdrop>
  );
}

/** Shown instead of the dashboard on a phone, a tablet or a narrow window: it is made for a computer's screen. */
export function ComputerOnly() {
  return (
    <Backdrop>
      <div className="rounded-3xl bg-white/[0.08] p-8 text-center text-white ring-1 ring-white/15 backdrop-blur-md">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Monitor className="size-6" /></span>
        <h1 className="mt-5 text-xl font-bold tracking-[-0.02em]">Open this on a computer</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">The site monitor is made for a computer’s screen and does not open on phones or tablets.</p>
      </div>
    </Backdrop>
  );
}
