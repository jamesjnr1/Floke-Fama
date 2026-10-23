import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { safeNext } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

/**
 * The admin console's own sign-in (/admin/login): a quiet, centred card on the deep green, separate from the
 * hospital portal's sign-in. Only accounts listed in ADMIN_EMAILS get through; there is no registration here.
 */
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const { next, signedout } = await searchParams;
  const target = safeNext(next);
  return (
    <main id="main" className="relative isolate grid min-h-[100svh] place-items-center bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] px-5 py-12">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />
      <div className="w-full max-w-[440px]">
        <div className="flex items-center justify-center gap-3 text-white">
          <LogoMark className="size-10" />
          <LogoWordmark className="h-6 text-white" />
        </div>
        <div className="mt-8 bg-paper p-7 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">Admin console</p>
          <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-ink">Sign in</h1>
          <p className="mt-2 text-ink-3">For Flokefama administrators. Hospitals sign in to the client portal instead.</p>
          <LoginForm
            admin
            next={target?.startsWith('/admin') ? target : '/admin'}
            notice={signedout ? 'You’ve been signed out.' : target ? 'Please sign in to open the admin console.' : undefined}
          />
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-white/75">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white">
            <Icon name="fi-rr-arrow-small-left" /> Back to site
          </Link>
          <Link href="/login" className="hover:text-white">
            Client portal sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
