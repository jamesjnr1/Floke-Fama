import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { safeNext } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Engineer portal sign in',
  description: 'Sign in to the Flokefama Biomedical Engineer Service Portal.',
  robots: { index: false },
  manifest: '/manifest-service.webmanifest',
};

/** What the portal holds, shown beside the form so engineers know they are in the right place. */
const inside = [
  { icon: 'fi-rr-clipboard-list', title: 'Service requests', body: 'Faults from hospitals: take the job, en route, on site, resolved.' },
  { icon: 'fi-rr-globe', title: 'From the website', body: 'Faults reported on the Support page: call back, or send an engineer.' },
  { icon: 'fi-rr-microscope', title: 'Equipment', body: 'Every system we look after, hospital by hospital.' },
  { icon: 'fi-rr-badge-check', title: 'Calibration', body: 'What is due, and the certificates you issue.' },
  { icon: 'fi-rr-bell', title: 'Alerts', body: 'New requests on your phone, even when the portal is closed.' },
];

/**
 * The engineer portal's own sign-in (/engineer/login), apart from the hospitals' client portal sign-in (/login):
 * the portal's contents on the deep green on the left, the sign-in on the right. Only engineer accounts get in
 * (ENGINEER_EMAILS, or added in the admin console); engineers are not registered here.
 */
export default async function EngineerLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const { next, signedout } = await searchParams;
  const target = safeNext(next);
  return (
    <main id="main" className="grid min-h-[100svh] grid-cols-1 bg-[#eef2f0] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_55%,#032a19_100%)] px-6 py-8 text-white md:px-12 md:py-12 lg:min-h-[100svh]">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgb(127_209_165/0.18),transparent_70%)]" />
        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <LogoWordmark className="h-[22px] text-white" />
          <span className="ml-1 text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-white/80">Service</span>
        </div>

        <div className="mt-10 max-w-lg lg:my-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-300">Engineer portal</p>
          <h1 className="mt-3 text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] !text-white">Every system, every visit, one workspace.</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">For Flokefama field and workshop engineers.</p>
          <ul className="mt-10 hidden space-y-5 md:block">
            {inside.map((x) => (
              <li key={x.title} className="flex items-start gap-4">
                <Icon name={x.icon} className="mt-1 text-xl text-brand-300" />
                <span>
                  <span className="block font-semibold">{x.title}</span>
                  <span className="block text-white/65">{x.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 hidden text-sm text-white/50 lg:block">© {new Date().getFullYear()} Flokefama Company Limited</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 md:px-12">
        <div className="w-full max-w-[440px] bg-white p-7 shadow-[0_30px_60px_-34px_rgb(11_21_16/0.35)] md:p-10">
          <span className="grid size-12 place-items-center bg-brand-50 text-xl text-brand-700">
            <Icon name="fi-rr-tools" />
          </span>
          <h2 className="mt-6 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-ink">Engineer sign in</h2>
          <p className="mt-2 text-ink-3">Use the email and password of your engineer account. New engineers get theirs from an administrator.</p>
          <LoginForm
            area="engineer"
            next={target?.startsWith('/engineer') ? target : '/engineer'}
            notice={signedout ? 'You’ve been signed out.' : target ? 'Please sign in to open the engineer portal.' : undefined}
          />
        </div>
      </section>
    </main>
  );
}
