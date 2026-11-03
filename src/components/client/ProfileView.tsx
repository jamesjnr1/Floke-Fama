'use client';

import { useActionState, useEffect } from 'react';
import { saveHospitalProfile, type ProfileFormState } from '@/lib/hospital-profile';
import { facilityTypes, profileComplete, type HospitalProfile } from '@/lib/hospital-profile-fields';
import { regions } from '@/lib/regions';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const field = 'h-12 w-full rounded-md border border-line bg-white px-3.5 text-[0.9375rem] text-ink outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15 aria-[invalid=true]:border-signal';

function Field({ label, hint, error, wide, children }: { label: string; hint?: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={cn('grid content-start gap-1.5', wide && 'md:col-span-2')}>
      <span className="text-[0.875rem] font-medium text-ink-2">{label}</span>
      {children}
      {error ? <span role="alert" className="text-[0.8125rem] text-signal-700">{error}</span> : hint ? <span className="text-[0.8125rem] text-ink-3">{hint}</span> : null}
    </label>
  );
}

/**
 * Hospital dashboard → Hospital profile: the hospital keeps its own details here (kind of facility, where it is, who
 * to call). Flokefama's engineers and admins see them; the admin console doesn't change them. The region also decides
 * which engineers an urgent job goes to first when nobody takes it.
 */
export function ProfileView({ initial, facility, demo, onSaved }: { initial: HospitalProfile | null; facility: string; demo?: boolean; onSaved: (p: HospitalProfile) => void }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(saveHospitalProfile, {});
  useEffect(() => {
    if (state.saved) onSaved(state.saved);
  }, [state.saved, onSaved]);
  const p = state.saved ?? initial ?? { name: facility };
  const v = (k: keyof HospitalProfile) => state.values?.[k] ?? (p[k] as string | undefined) ?? '';
  const e = state.errors ?? {};
  const complete = profileComplete(p);
  return (
    <div className="max-w-4xl">
      <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand-700">Hospital profile</p>
      <h2 className="mt-1 text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">{p.name}</h2>
      <p className="mt-2 max-w-2xl text-[1.0625rem] text-ink-3">
        Where you are and who to call. Our engineers use these details to find you and reach you, and the region decides which engineers your urgent requests go to first. Keep them up to date.
      </p>
      {!complete && !state.saved && (
        <p className="mt-4 flex items-start gap-2.5 rounded-md bg-[#fff7e6] px-4 py-3 text-[0.9375rem] text-[#7a5200]">
          <Icon name="fi-rr-info" className="mt-0.5 shrink-0" /> Please fill in your details. It takes about a minute.
        </p>
      )}
      <form key={p.updatedAt ?? 'new'} action={action} noValidate className="mt-6 rounded-xl border border-line bg-paper p-5 md:p-7">
        <fieldset disabled={demo || pending} className="grid gap-5 md:grid-cols-2">
          <legend className="sr-only">Hospital details</legend>
          <p className="text-[0.9375rem] font-semibold text-ink md:col-span-2">About the facility</p>
          <Field label="Kind of facility" error={e.type}>
            <select name="type" defaultValue={v('type')} aria-invalid={!!e.type} className={cn(field, 'pr-9')}>
              <option value="" disabled>Choose…</option>
              {facilityTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Hospital code" hint="Quote it when you call us">
            <input value={p.code ?? 'Given when you save'} readOnly className={cn(field, 'bg-[#f6f8f7] font-mono text-ink-3')} />
          </Field>

          <p className="mt-2 text-[0.9375rem] font-semibold text-ink md:col-span-2">Location</p>
          <Field label="Region" error={e.region}>
            <select name="region" defaultValue={v('region')} aria-invalid={!!e.region} className={cn(field, 'pr-9')}>
              <option value="" disabled>Choose…</option>
              {regions.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Town or city" error={e.town}>
            <input name="town" defaultValue={v('town')} placeholder="e.g. Kumasi" aria-invalid={!!e.town} className={field} />
          </Field>
          <Field label="Address and directions" hint="Street, area and a landmark, so an engineer can find you" error={e.address} wide>
            <textarea name="address" defaultValue={v('address')} rows={3} placeholder="e.g. Castle Road, Ridge, opposite the Ridge roundabout" aria-invalid={!!e.address} className={cn(field, 'h-auto py-3 leading-relaxed')} />
          </Field>
          <Field label="GhanaPost digital address (optional)" hint="From the GhanaPost GPS app, e.g. GA-123-4567" error={e.gps}>
            <input name="gps" defaultValue={v('gps')} placeholder="GA-123-4567" autoCapitalize="characters" aria-invalid={!!e.gps} className={cn(field, 'font-mono uppercase')} />
          </Field>

          <p className="mt-2 text-[0.9375rem] font-semibold text-ink md:col-span-2">Contact</p>
          <Field label="Main phone number" hint="The number we call about your equipment" error={e.phone}>
            <input name="phone" type="tel" defaultValue={v('phone')} placeholder="e.g. 030 222 1234" aria-invalid={!!e.phone} className={field} />
          </Field>
          <Field label="Contact person" hint="Their name and role, e.g. Head of laboratory" error={e.contactName}>
            <input name="contactName" defaultValue={v('contactName')} aria-invalid={!!e.contactName} className={field} />
          </Field>
          <Field label="Contact email (optional)" error={e.email} wide>
            <input name="email" type="email" defaultValue={v('email')} aria-invalid={!!e.email} className={cn(field, 'md:max-w-md')} />
          </Field>
        </fieldset>
        {e.form && <p role="alert" className="mt-4 text-[0.9375rem] text-signal-700">{e.form}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={demo || pending} className="inline-flex h-12 items-center gap-2 rounded-md bg-brand-700 px-6 text-[0.9375rem] font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
            <Icon name="fi-rr-check" /> {pending ? 'Saving…' : 'Save profile'}
          </button>
          {state.saved && !pending && <span role="status" className="flex items-center gap-1.5 text-[0.9375rem] font-medium text-brand-700"><Icon name="fi-rr-check-circle" /> Saved</span>}
          {demo && <span className="text-[0.9375rem] text-ink-3">Not saved in the demo.</span>}
          {p.updatedAt && !state.saved && <span className="text-[0.875rem] text-ink-3">Last updated {new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
        </div>
      </form>
    </div>
  );
}

/** On the overview until the profile is filled in. */
export function CompleteProfileCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#f1d18a] bg-[#fff8e8] px-5 py-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f6c34a]/30 text-xl text-[#8a5a00]"><Icon name="fi-rr-hospital" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">Complete your hospital profile</p>
        <p className="text-[0.9375rem] text-ink-3">Add where you are and who to call, so our engineers can find and reach you quickly.</p>
      </div>
      <button type="button" onClick={onOpen} className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800">
        Complete profile <Icon name="fi-rr-arrow-small-right" />
      </button>
    </div>
  );
}
