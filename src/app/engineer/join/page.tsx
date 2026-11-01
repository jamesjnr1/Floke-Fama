import type { Metadata } from 'next';
import Link from 'next/link';
import { JoinForm } from '@/components/engineer/join-form';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { checkInvite } from '@/lib/engineer-team';

export const metadata: Metadata = { title: 'Register as a Flokefama engineer', robots: { index: false } };
export const dynamic = 'force-dynamic';

/**
 * Engineers register here from the invite link their manager sends (WhatsApp or email): one short form, made for a
 * phone. The account waits for the manager's approval; they get a text when they can sign in.
 */
export default async function EngineerJoinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const valid = await checkInvite(code);
  return (
    <main id="main" className="min-h-svh bg-[#eef2f0] px-4 pb-12 pt-14 md:pt-20">
      <div className="mx-auto w-full max-w-[520px]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark className="size-9" />
          <LogoWordmark className="h-[20px] text-[#00703A]" />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-[0_30px_60px_-34px_rgb(11_21_16/0.35)] md:p-9">
          {valid ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">Engineer registration</p>
              <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-ink">Join the Flokefama engineers</h1>
              <p className="mt-2 text-[1.0625rem] text-ink-2">Fill in your details. Your manager approves you, then you get a text and can sign in.</p>
              <JoinForm code={code!} />
            </>
          ) : (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#fdecec] text-2xl text-signal-700"><Icon name="fi-rr-link" /></span>
              <h1 className="mt-4 text-[1.5rem] font-bold text-ink">This link has expired</h1>
              <p className="mt-2 text-[1.0625rem] text-ink-2">Ask your manager for a new registration link.</p>
              <Link href="/engineer/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl border border-line px-5 font-semibold text-ink hover:border-ink/30">I already have an account</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
