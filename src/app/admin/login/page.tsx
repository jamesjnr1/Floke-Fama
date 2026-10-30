import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/auth/login-form';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { safeNext } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Admin console sign in',
  description: 'Sign in to the Flokefama admin console: orders, accounts, product demand, the service desk and site health.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/admin/login' },
};

/** What the console holds, shown beside the form so staff know they are in the right place. */
const inside = [
  { icon: 'fi-rr-box-open', title: 'Orders', body: 'Every order, from payment to delivery.' },
  { icon: 'fi-rr-users', title: 'Accounts', body: 'Who registers and who buys.' },
  { icon: 'fi-rr-shopping-cart', title: 'Product demand', body: 'What hospitals order most.' },
  { icon: 'fi-rr-tools', title: 'Service desk', body: 'Requests, engineers and calibrations.' },
  { icon: 'fi-rr-database', title: 'Database & settings', body: 'The health of the site behind the scenes.' },
];

/**
 * The admin console's own sign-in (/admin/login), apart from the hospital portal and the website (no links out):
 * the console's contents on the deep green on the left, the sign-in on the right. Only ADMIN_EMAILS get through,
 * and the session it starts is the console's own, so the admin never shows as signed in on the website.
 */
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; signedout?: string }> }) {
  const { next, signedout } = await searchParams;
  const target = safeNext(next);
  return (
    <main id="main" className="grid min-h-[100svh] grid-cols-1 bg-[#eef2f0] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative isolate flex flex-col overflow-hidden bg-brand-900 px-6 py-8 text-white md:px-12 md:py-12 lg:min-h-[100svh]">
        <Image src="/my_image.png" alt="Flokefama sign-in page background" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(3_42_25/0.82)_0%,rgb(6_72_42/0.72)_55%,rgb(3_42_25/0.9)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgb(127_209_165/0.18),transparent_70%)]" />
        {/* Faint rings in the corner */}
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 -z-10">
          {[320, 460, 600].map((s) => (
            <span key={s} className="absolute bottom-0 right-0 rounded-full border border-white/10" style={{ width: s, height: s, transform: `translate(${(s - 320) / 2}px, ${(s - 320) / 2}px)` }} />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LogoMark className="size-10" />
          <LogoWordmark className="h-[22px] text-white" />
        </div>

        <div className="mt-10 max-w-lg lg:my-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-300">Admin console</p>
          <h1 className="mt-3 text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] !text-white">Everything behind Flokefama, in one place.</h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">For Flokefama administrators only.</p>
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
            <Icon name="fi-rr-lock" />
          </span>
          <h2 className="mt-6 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-ink">Sign in</h2>
          <p className="mt-2 text-ink-3">Use the email and password of your administrator account.</p>
          <LoginForm
            area="admin"
            next={target?.startsWith('/admin') ? target : '/admin'}
            notice={signedout ? 'You’ve been signed out.' : target ? 'Please sign in to open the admin console.' : undefined}
          />
        </div>
      </section>
    </main>
  );
}
