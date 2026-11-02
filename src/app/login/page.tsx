import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AccessPanel } from '@/components/auth/access-panel';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { safeNext } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Portal access', robots: { index: false } };

/**
 * Portal access for hospitals: a split screen outside the marketing chrome. Two Flokefama engineers on the left (the
 * CEO: only photos of people we know) with the company statement, a quiet light panel on the right with Sign in and
 * Register tabs. On phones the photo becomes a short banner. Engineers sign in
 * on their own page (/engineer/login), linked at the foot.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string; mode?: string }> }) {
  const { next, signedout, mode } = await searchParams;

  return (
    <main id="main" className="grid min-h-[calc(100svh-var(--banner))] bg-paper pt-[var(--banner)] lg:grid-cols-2">
      <section className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden bg-brand-800 p-6 text-white h-[40svh] md:p-10 lg:sticky lg:top-0 lg:h-[100svh] lg:p-12 lg:pb-28">
        <Image
          src="/images/headers/login-team.webp"
          alt="Two Flokefama engineers looking at a laptop together"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="-z-20 object-cover object-[42%_38%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-brand-800/15 mix-blend-multiply" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_21_16/0.4)_0%,transparent_28%,transparent_45%,rgb(19_66_40/0.7)_75%,rgb(11_21_16/0.92)_100%)]" />

        <Logo />

        <div className="max-w-lg">
          <h1 className="text-[clamp(19px,14px+1.1vw,28px)] font-semibold leading-[1.3] tracking-[-0.01em] text-white">
            Revolutionizing healthcare practices in Ghana by introducing cutting-edge technologies and solutions that set new standards in medical care and
            patient safety.
          </h1>
        </div>
      </section>

      <section className="flex flex-col px-5 py-8 md:px-10 lg:min-h-[100svh] lg:px-16 lg:py-12">
        <div className="flex justify-end">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-3 transition hover:bg-mist hover:text-ink">
            <Icon name="fi-rr-arrow-small-left" /> Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8">
          <Logo tone="light" className="hidden lg:flex" />
          <AccessPanel
            next={safeNext(next) ?? undefined}
            notice={signedout ? 'You’ve been signed out.' : next ? 'Please sign in with your hospital account to continue.' : undefined}
            engineer={false}
            initialMode={mode === 'register' ? 'register' : 'signin'}
          />
          <p className="mt-10 border-t border-line pt-5 text-sm text-ink-3">
            Flokefama engineer? <Link href="/engineer/login" className="font-semibold text-brand-700 hover:underline">Sign in to the engineer portal</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
