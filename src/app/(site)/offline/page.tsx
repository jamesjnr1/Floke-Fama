import type { Metadata } from 'next';
import { Icon } from '@/components/ui/icon';
import { branches, contact } from '@/data/seed';

export const metadata: Metadata = { title: 'Offline', robots: { index: false } };

/** Served by the service worker when there is no connection. Emergency contacts always work offline. */
export default function OfflinePage() {
  return (
    <div className="bg-canvas pt-20">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <p className="label">You’re offline</p>
        <h1 className="display mt-5 text-5xl md:text-6xl">Support is still one call away.</h1>
        <p className="mt-6 font-light text-ink-3">
          Your connection dropped. Pages you’ve already opened, including product spec sheets, remain available. For urgent equipment faults, contact our biomedical support team directly.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a href={contact.phoneHref} className="flex items-center gap-4 rounded-3xl bg-brand-600 p-6 text-white">
            <Icon name="fi-rr-phone-call" className="text-2xl" />
            <span><span className="block text-xs text-white/70">Emergency biomedical support</span><span className="text-lg font-semibold">{contact.phone}</span></span>
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
