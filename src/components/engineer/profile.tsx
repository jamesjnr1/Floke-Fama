'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { updateProfile, type ProfileState } from '@/lib/auth/actions';
import { useEngineerPhoto } from '@/components/engineer/photo';
import { LogoMark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';

const field = 'h-12 w-full border border-line bg-paper px-4 text-base text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-signal';

/**
 * The engineer's own profile: their photo and phone number (what hospitals see, and where texts go), with links
 * to change the photo and the password. Name and email are set by an admin.
 */
export function EngineerProfile({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const photo = useEngineerPhoto();
  const e = state.errors ?? {};
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center bg-[#eef2f0] px-5 py-12">
      <div className="w-full max-w-[480px]">
        <Link href="/engineer" className="mb-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-3 hover:text-ink">
          <Icon name="fi-rr-arrow-small-left" /> Back to the engineer portal
        </Link>
        <div className="bg-white p-7 shadow-[0_30px_60px_-34px_rgb(11_21_16/0.35)] md:p-10">
          <LogoMark className="size-10" />
          <h1 className="mt-6 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-ink">My profile</h1>
          <p className="mt-2 text-ink-3">What hospitals see when you take their job, and where your texts go.</p>

          <div className="mt-8 flex items-center gap-4">
            <span className="relative size-20 shrink-0 overflow-hidden rounded-full bg-mist">
              {photo.url ? <Image src={photo.url} alt="Your photo" fill sizes="80px" className="object-cover" unoptimized /> : <Icon name="fi-rr-user" className="absolute inset-0 m-auto size-fit text-2xl text-ink-3" />}
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-ink">{name}</span>
              <span className="block truncate text-ink-3">{email}</span>
              <Link href="/engineer?photo=1" className="mt-1 inline-block text-[0.9375rem] font-medium text-brand-700 hover:underline">Change photo</Link>
            </span>
          </div>

          <form action={action} noValidate className="mt-8 space-y-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-ink-2">Phone number</span>
              <input name="phone" type="tel" autoComplete="tel" defaultValue={state.phone ?? phone} placeholder="e.g. 024 123 4567" aria-invalid={!!e.phone} className={field} />
              <span className="text-xs text-ink-3">Hospitals see it on the jobs you take, and your job texts come to it.</span>
              {e.phone && <span role="alert" className="text-xs text-signal-700">{e.phone}</span>}
            </label>
            {e.form && <p role="alert" className="text-sm text-signal-700">{e.form}</p>}
            {state.done && (
              <p role="status" className="flex items-center gap-2 font-semibold text-brand-700">
                <Icon name="fi-rr-check-circle" /> Saved. Hospitals on your open jobs now see {state.phone}.
              </p>
            )}
            <button disabled={pending} className="h-12 w-full bg-brand-700 font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60">
              {pending ? 'Saving…' : 'Save'}
            </button>
          </form>

          <div className="mt-8 space-y-2 border-t border-line pt-6 text-[0.9375rem]">
            <Link href="/engineer/password" className="flex items-center gap-2 font-medium text-ink hover:text-brand-700"><Icon name="fi-rr-lock" /> Change password</Link>
            <p className="text-ink-3">To change your name or email, ask an admin.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
