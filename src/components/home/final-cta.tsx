import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { branches, contact } from '@/data/seed';

export function FinalCta() {
  return (
    <section className="border-t border-line bg-paper py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label">Procurement</p>
          <h2 className="display mt-5 max-w-5xl text-[clamp(2.75rem,1.2rem+6vw,7.5rem)]">
            Equip your facility <span className="text-brand-600">with confidence.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/quote">Start a quote request <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={contact.phoneHref}><Icon name="fi-rr-phone-call" /> {contact.phone}</a>
          </Button>
        </Reveal>
        <ul className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {branches.map((b) => (
            <li key={b.name} className="bg-paper p-5">
              <Icon name="fi-rr-marker" className="text-brand-600" />
              <p className="mt-3 font-medium text-ink">{b.name}</p>
              <p className="text-xs font-light text-ink-3">{b.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
