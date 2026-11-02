import type { Metadata } from 'next';
import Link from 'next/link';
import { logout } from '@/lib/auth/actions';

export const metadata: Metadata = { title: 'Account not active', robots: { index: false } };

/** A hospital made inactive in the registry (admin console → Hospitals) lands here instead of its dashboard. */
export default function AccountInactivePage() {
  return (
    <main id="main" className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-[2rem] font-bold tracking-[-0.02em] text-ink">This hospital’s account is not active</h1>
      <p className="mt-4 text-lg text-ink-2">Your hospital dashboard has been switched off. To use it again, please call Flokefama on <a href="tel:+233533392863" className="font-semibold text-brand-700">+233 53 339 2863</a>.</p>
      <div className="mt-8 flex justify-center gap-3">
        <form action={logout}>
          <button className="h-12 rounded-lg border border-line px-5 font-semibold text-ink hover:border-ink/30">Sign out</button>
        </form>
        <Link href="/" className="inline-flex h-12 items-center rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">Go to the website</Link>
      </div>
    </main>
  );
}
