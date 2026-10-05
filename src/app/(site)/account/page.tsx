import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { logout } from '@/lib/auth/actions';
import { getSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** My account: who is signed in, and the next things they can do. */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/account');
  const first = session.name.split(' ')[0];

  const actions = [
    { href: '/checkout', icon: 'fi-rr-shopping-cart', title: 'Cart & checkout', body: 'Review your cart and pay securely.' },
    { href: '/products', icon: 'fi-rr-search', title: 'Shop equipment', body: 'Browse all 92 products and add them to your cart.' },
    { href: '/quote', icon: 'fi-rr-clipboard-list', title: 'Request a quote', body: 'Ask for pricing, installation and service packages.' },
    ...(session.role === 'client' ? [{ href: '/portal', icon: 'fi-rr-apps', title: 'Client portal', body: 'Service requests, equipment and certificates.' }] : []),
  ];

  return (
    <div className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1080px] px-5 md:px-10">
        <h1 className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold tracking-[-0.03em] text-ink">Welcome, {first}</h1>
        <p className="mt-2 text-ink-3">You’re signed in. For your security we sign you out after an hour without activity.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {actions.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-6 transition hover:-translate-y-0.5 hover:border-brand-300">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-xl text-brand-700"><Icon name={a.icon} /></span>
                  <span className="mt-5 text-lg font-bold text-ink">{a.title}</span>
                  <span className="mt-1 text-ink-3">{a.body}</span>
                </Link>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-line bg-paper p-6">
            <h2 className="text-lg font-bold text-ink">Your details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-ink-3">Name</dt><dd className="font-medium text-ink">{session.name}</dd></div>
              <div><dt className="text-ink-3">Email</dt><dd className="font-medium text-ink">{session.email}</dd></div>
              {session.facility && <div><dt className="text-ink-3">Organisation</dt><dd className="font-medium text-ink">{session.facility}</dd></div>}
              {session.phone && <div><dt className="text-ink-3">Phone</dt><dd className="font-medium text-ink">{session.phone}</dd></div>}
            </dl>
            <form action={logout} className="mt-6">
              <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 border border-line font-semibold text-ink hover:border-ink/30">
                <Icon name="fi-rr-sign-out-alt" /> Sign out
              </button>
            </form>
            <p className="mt-4 text-sm text-ink-3">Need to change your details? Call <a href={contact.phoneHref} className="font-medium text-brand-700">{contact.phone}</a>.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
