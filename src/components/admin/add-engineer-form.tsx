'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { addEngineer, type AddEngineerState } from '@/lib/admin/actions';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** A strong temporary password the admin can pass on (letters and digits without look-alikes). */
function suggest() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return [...bytes].map((b) => chars[b % chars.length]).join('');
}

const field = 'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[0.9375rem] outline-none focus:border-brand-600 aria-[invalid=true]:border-signal';

/** Admin console → Accounts: add an engineer, then show the sign-in details to pass on. */
export function AddEngineerForm() {
  const [state, action, pending] = useActionState<AddEngineerState, FormData>(addEngineer, {});
  // Suggested in the browser once the form is shown, so the server and the browser never disagree about it; anything
  // already typed in (on a slow phone, before the page's scripts were ready) is kept
  const [password, setPassword] = useState('');
  const passwordField = useRef<HTMLInputElement>(null);
  useEffect(() => setPassword((p) => p || passwordField.current?.value || suggest()), []);
  const [copied, setCopied] = useState(false);
  const e = state.errors ?? {};

  if (state.done) {
    const details = `Flokefama engineer portal\nSign in: ${location.origin}/engineer/login\nEmail: ${state.done.email}\nPassword: ${state.done.password}`;
    return (
      <div>
        <p className="flex items-center gap-2 text-lg font-semibold text-brand-800">
          <Icon name="fi-rr-check-circle" className="text-brand-600" /> {state.done.name} can now sign in to the engineer portal.
        </p>
        <p className="mt-1 text-[0.9375rem] text-ink-3">Pass these details on to them. The password is shown only now; it isn’t stored in readable form.</p>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-[#f6f8f7] p-4 font-mono text-[0.875rem] text-ink">{details}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(details).then(() => setCopied(true))}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800"
          >
            <Icon name={copied ? 'fi-rr-check' : 'fi-rr-copy'} /> {copied ? 'Copied' : 'Copy details'}
          </button>
          <Link href="/admin?tab=accounts&role=engineer" className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[0.9375rem] font-medium hover:border-ink/30">
            Done
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Full name" error={e.name}>
          <input name="name" defaultValue={state.values?.name} autoComplete="off" aria-invalid={!!e.name} className={field} />
        </Field>
        <Field label="Email" error={e.email}>
          <input name="email" type="email" defaultValue={state.values?.email} autoComplete="off" aria-invalid={!!e.email} className={field} />
        </Field>
        <Field label="Phone" error={e.phone}>
          <input name="phone" type="tel" defaultValue={state.values?.phone} placeholder="+233" autoComplete="off" aria-invalid={!!e.phone} className={field} />
        </Field>
        <Field label="Temporary password" error={e.password}>
          <span className="flex gap-2">
            <input ref={passwordField} name="password" value={password} onChange={(ev) => setPassword(ev.target.value)} autoComplete="new-password" aria-invalid={!!e.password} className={cn(field, 'font-mono')} />
            <button type="button" onClick={() => setPassword(suggest())} title="Suggest another" aria-label="Suggest another password" className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white hover:border-ink/30">
              <Icon name="fi-rr-refresh" />
            </button>
          </span>
        </Field>
      </div>
      {e.form && <p role="alert" className="mt-4 text-[0.9375rem] text-signal-700">{e.form}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
          <Icon name="fi-rr-user-add" /> {pending ? 'Adding…' : 'Add engineer'}
        </button>
        <Link href="/admin?tab=accounts&role=engineer" className="text-[0.9375rem] font-medium text-ink-3 hover:text-ink">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid content-start gap-1.5">
      <span className="text-[0.875rem] font-medium text-ink-2">{label}</span>
      {children}
      {error && <span role="alert" className="text-[0.8125rem] text-signal-700">{error}</span>}
    </label>
  );
}
