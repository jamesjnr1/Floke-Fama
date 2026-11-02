import type { Metadata } from 'next';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';

export const metadata: Metadata = { title: 'Offline', robots: { index: false } };

/** Served by the service worker when there is no connection. Emergency contacts always work offline. */
export default async function OfflinePage() {
  const { branches, contact } = await getSite();
  return (
    <div className="bg-canvas">
      {/* A dark band at the top, like the site's other pages: this page is shown in place of any page (whatever its
          address), and the menu bar is see-through over the dark headers, so on a light top it would vanish */}
      <div className="bg-[radial-gradient(120%_90%_at_10%_0%,#0d7a4b_0%,#06482a_55%,#032a19_100%)] pb-14 pt-36 text-white md:pb-20 md:pt-44">
        <div className="mx-auto max-w-3xl px-5">
          <h1 className="display text-5xl text-white md:text-6xl">Support is still one call away.</h1>
          <p className="mt-6 text-lg text-white/85">
            Your connection dropped. Pages you’ve already opened, including product spec sheets, remain available. For urgent equipment faults, contact our biomedical support team directly.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pb-24">
        <div className="grid gap-3 sm:grid-cols-2">
          <a href={contact.phoneHref} className="flex items-center gap-4 rounded-3xl bg-brand-600 p-6 text-white">
            <Icon name="fi-rr-phone-call" className="text-2xl" />
            <span><span className="block text-xs text-white/80">Emergency biomedical support</span><span className="text-lg font-semibold">{contact.phone}</span></span>
          </a>
          <a href={`mailto:${contact.support}`} className="flex items-center gap-4 rounded-3xl border border-line bg-paper p-6">
            <Icon name="fi-rr-envelope" className="text-2xl text-brand-600" />
            <span><span className="block text-xs text-ink-3">Support desk</span><span className="font-semibold text-ink">{contact.support}</span></span>
          </a>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {branches.map((b) => (
            <li key={b.name} className="rounded-2xl border border-line bg-paper p-4">
              <p className="font-medium text-ink">{b.name}</p>
              <p className="text-xs text-ink-3">{b.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
