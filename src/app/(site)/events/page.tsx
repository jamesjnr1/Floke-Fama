import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { events } from '@/data/seed';
import { cn } from '@/lib/utils';

// Re-render daily so events move from Upcoming to Past on their own.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Events & Activities',
  description: 'Flokefama events, activities and news from the Media Centre: awards, press, partnerships and community programmes.',
  alternates: { canonical: '/events' },
};

export default function EventsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);
  return (
    <>
      <PageHero
        label="Events & activities"
        title={<>Moments that <span className="text-gradient">bring us together</span></>}
        lead="Celebrations, community programmes and industry events from across the Flokefama family."
      />

      <section className="bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">Upcoming</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">What’s next.</h2>
            </div>
          </Reveal>
          {upcoming.length === 0 ? (
            <Reveal delay={0.06}>
              <p className="mt-8 flex items-center gap-3 rounded-3xl border border-dashed border-line bg-canvas p-6 text-ink-3">
                <Icon name="fi-rr-calendar" className="text-brand-600" /> There are no upcoming events right now. New dates are announced here and in the news below.
              </p>
            </Reveal>
          ) : (
            <EventList items={upcoming} />
          )}

          {past.length > 0 && (
            <>
              <Reveal>
                <p className="label mt-20">Latest past events</p>
              </Reveal>
              <EventList items={past} />
            </>
          )}
        </div>
      </section>

      <NewsGrid />
    </>
  );
}

function EventList({ items }: { items: typeof events }) {
  return (
    <ul className="mt-6 space-y-4">
      {items.map((e, i) => (
        <li key={e.id}>
          <Reveal delay={i * 0.05}>
            <article className={cn('overflow-hidden rounded-4xl border border-line bg-canvas', e.image && 'md:grid md:grid-cols-2 md:items-center')}>
              {e.image && (
                <div className="relative aspect-[16/9] bg-paper">
                  <Image src={e.image} alt={e.alt} fill sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-midnight text-center text-white">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-brand-300">{e.month}</p>
                      <p className="text-3xl font-bold leading-none tracking-[-0.03em]">{e.day}</p>
                      <p className="mt-1 font-mono text-[11px] text-white/50">{e.year}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{e.price}</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.02em]">{e.title}</h3>
                <p className="mt-2 font-light leading-relaxed text-ink-3">{e.body}</p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
                  <li className="flex items-center gap-2"><Icon name="fi-rr-clock" className="text-brand-600" /> {e.time}</li>
                  <li className="flex items-center gap-2"><Icon name="fi-rr-marker" className="text-brand-600" /> {e.venue}</li>
                </ul>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
