import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { serviceList } from '@/data/seed';

/** Home: a one-line pointer to Products & Services, where the full service lifecycle lives. */
export function ServicesTeaser() {
  return (
    <section className="border-y border-line bg-paper py-16 md:py-20">
      <Reveal className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <p className="label">Our services</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink md:text-4xl">From supply to service, one partner.</h2>
        </div>
        <ol className="flex flex-wrap gap-2 lg:max-w-xl">
          {serviceList.map((s, i) => (
            <li key={s.title} className="rounded-full border border-line bg-canvas px-3.5 py-1.5 text-sm text-ink-2">
              <span className="mr-1.5 font-mono text-xs text-brand-600">{String(i + 1).padStart(2, '0')}</span>
              {s.title}
            </li>
          ))}
        </ol>
        <Link href="/services" className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-brand-700">
          How we work <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  );
}
