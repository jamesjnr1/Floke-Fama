import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { equipment } from '@/data/equipment';

/**
 * The equipment the CEO's review asks to feature prominently (point 1): imaging, critical care, renal and neonatal
 * care alongside the laboratory range, each with a photo, a short description and a quote link.
 */
export function EquipmentShowcase() {
  const credited = equipment.filter((e) => e.credit);
  return (
    <section id="equipment" className="pattern-dots scroll-mt-28 border-t border-line bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="max-w-2xl">
          <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)]">Medical equipment we supply</h2>
          <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">From diagnostic imaging to critical and neonatal care: complete solutions for hospitals, clinics and laboratories, installed and supported by our engineers.</p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {equipment.map((e) => (
            <li key={e.slug}>
              <Link href={`/quote?need=${encodeURIComponent(e.title)}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper transition hover:border-ink/20">
                <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                  <Image src={e.image} alt={e.title} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm font-semibold text-brand-700">{e.group}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-[-0.01em] text-ink">{e.title}</h3>
                  <p className="no-justify mt-2 leading-relaxed text-ink-3">{e.text}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[0.9375rem] font-semibold text-brand-700">Request a quote <Icon name="fi-rr-arrow-small-right" /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="no-justify mt-6 text-xs leading-relaxed text-ink-3">
          Illustrative photos. Images via Pexels and Wikimedia Commons:{' '}
          {credited.map((e, i) => (
            <span key={e.slug}>
              {e.title.toLowerCase()} by{' '}
              <a href={e.credit!.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">{e.credit!.author}</a> ({e.credit!.license}){i < credited.length - 1 ? '; ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
