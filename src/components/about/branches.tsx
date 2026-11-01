import { MapPin } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';
import { cn, telHref } from '@/lib/utils';

const pin = ['text-brand-600', 'text-[#087d88]', 'text-[#0068a8]', 'text-signal-700', 'text-[#a87a00]', 'text-brand-600'];

/** About: the six Flokefama branches as a grid of boxes, each with directions in Google Maps and its phone number. */
export async function Branches() {
  const { branches } = await getSite();
  return (
    <section id="branches" className="pattern-dots pattern-br scroll-mt-28 bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">Our branches</h2>
          <p className="max-w-md text-ink-3">Six branches across Ghana, so support is never far from your facility.</p>
        </Reveal>
        <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b, i) => (
            <li key={b.name} className="flex items-start gap-5 bg-paper p-7 lg:p-8">
              <MapPin className={cn('mt-1 size-7 shrink-0', pin[i % pin.length])} strokeWidth={1.7} aria-hidden />
              <div className="flex flex-col gap-1.5">
                <p className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-[-0.02em] text-ink">
                  {b.name}
                  {i === 0 && <span className="bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Head office</span>}
                </p>
                <p className="text-base text-ink-3">{b.detail}</p>
                {b.phone && (
                  <a href={telHref(b.phone)} className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-ink hover:text-brand-700">
                    <Icon name="fi-rr-phone-call" className="text-brand-600" /> {b.phone}
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Flokefama ${b.name} ${b.detail}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                  Get directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
