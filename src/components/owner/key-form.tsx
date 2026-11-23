'use client';

import { Lock, Monitor } from 'lucide-react';
import { useActionState, type ReactNode } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { unlock, type UnlockState } from '@/lib/owner/actions';

/** The dashboard's backdrop when it is closed: the admin console's deep green, plain and calm. */
function Backdrop({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_55%,#032a19_100%)] px-5 py-10">
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
        <span className="grid size-11 place-items-center rounded-2xl bg-[#06482a] text-white"><Lock className="size-5" /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">Site monitor</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-3">Private. Enter your key to open the dashboard.</p>
        {ready ? (
          <>
            <label htmlFor="key" className="mt-6 block text-sm font-semibold text-ink-2">Key</label>
            <input id="key" name="key" type="password" required autoFocus autoComplete="current-password" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15" />
            {state.error && <p role="alert" className="mt-3 text-sm font-medium text-signal-700">{state.error}</p>}
            <button type="submit" disabled={pending} className="mt-6 w-full rounded-xl bg-[#06482a] px-4 py-3 font-semibold text-white transition hover:bg-[#0a5a33] disabled:opacity-60">
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

/** Shown instead of the dashboard on a phone or a narrow window: it is made for a computer's or a tablet's screen. */
export function ComputerOnly() {
  return (
    <Backdrop>
      <div className="rounded-3xl bg-white/[0.08] p-8 text-center text-white ring-1 ring-white/15 backdrop-blur-md">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Monitor className="size-6" /></span>
        <h1 className="mt-5 text-xl font-bold tracking-[-0.02em]">Open this on a computer or tablet</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/75">The site monitor is made for a bigger screen and does not open on phones.</p>
      </div>
    </Backdrop>
  );
}
