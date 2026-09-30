import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { NetworkCanvas } from '@/components/home/network-canvas';
import { Icon } from '@/components/ui/icon';
import { safeNext } from '@/lib/auth/session';
import { demoAccountsEnabled, demoCredentials } from '@/lib/auth/users';
import { contact } from '@/data/seed';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const { next, signedout } = await searchParams;
  const toEngineer = next?.startsWith('/engineer');

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-midnight text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-56 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.26),transparent_62%)]" />
        <div className="grid-fade absolute inset-0 opacity-60" />
        <NetworkCanvas className="absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent_0%,transparent_35%,#000_80%)]" />
      </div>

      <div className="mx-auto grid min-h-[100svh] max-w-[1280px] items-center gap-12 px-5 pb-16 pt-36 md:px-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="label flex items-center gap-3 !text-brand-300">
            <span className="status-dot" aria-hidden /> {toEngineer ? 'Engineer workspace' : 'Flokefama Care'}
          </p>
          <h1 className="display mt-6 text-[clamp(2.5rem,1.2rem+4vw,4.5rem)] uppercase leading-[0.96] text-white">
            {toEngineer ? (<>Service portal <span className="text-gradient">sign in</span></>) : (<>Client portal <span className="text-gradient">access</span></>)}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
            {toEngineer
              ? 'The Biomedical Engineer Service Portal for Flokefama field and workshop teams.'
              : 'Track service tickets, follow your engineer, and keep manuals and calibration records for every installed system.'}
          </p>
          {!toEngineer && (
            <ul className="mt-8 space-y-3 text-sm text-white/70">
              {[
                ['fi-rr-headset', 'Live service tickets and engineer dispatch'],
                ['fi-rr-box-open', 'Your installed inventory in one place'],
                ['fi-rr-chart-line-up', 'Calibration certificates on demand'],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3"><Icon name={icon} className="text-brand-400" /> {text}</li>
              ))}
            </ul>
          )}
          <p className="mt-10 text-sm text-white/45">
            No account yet? Call <a href={contact.phoneHref} className="text-white underline-offset-4 hover:underline">{contact.phone}</a> or email{' '}
            <a href={`mailto:${contact.support}`} className="text-white underline-offset-4 hover:underline">{contact.support}</a>.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <LoginForm
            next={safeNext(next) ?? undefined}
            demo={demoAccountsEnabled ? demoCredentials : []}
            notice={signedout ? 'You’ve been signed out.' : undefined}
          />
        </div>
      </div>
    </section>
  );
}
