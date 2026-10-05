import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getEvents } from '@/lib/data';
import { longDate } from '@/lib/events';
import type { EventItem } from '@/lib/types';
import { siteUrl } from '@/lib/utils';

// Re-render daily so events move from Upcoming to Past, and the countdown stays right.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Events & Activities',
  description: 'Flokefama events, activities and news from the Media Centre: Floke Praise, awards, press, partnerships and community programmes.',
  alternates: { canonical: '/events' },
};

export default async function EventsPage() {
  const events = await getEvents();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const jsonLd = upcoming.map((e) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    startDate: e.start,
    ...(e.end ? { endDate: e.end } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: 'Accra', addressCountry: 'GH' } },
    image: e.image ? [`${siteUrl}${e.image}`] : undefined,
    description: [e.body, e.theme].filter(Boolean).join(' '),
    organizer: { '@type': 'Organization', name: 'Flokefama Company Limited', url: siteUrl },
    ...(e.guests ? { performer: { '@type': 'PerformingGroup', name: e.guests } } : {}),
  }));

  return (
    <>
      <PageHero
        image="/images/headers/events-ghana.webp"
        position="50% 40%"
        label="Events & activities"
        title={<>Moments that <span className="text-brand-600">bring us together</span></>}
        lead="Celebrations, community programmes and industry events from across the Flokefama family."
      />

      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-[-0.01em] text-ink">Upcoming events</h2>
          </Reveal>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-ink-3">There are no upcoming events right now. New dates are announced here and in the news below.</p>
          ) : (
            <EventGrid events={upcoming} />
          )}

          {past.length > 0 && (
            <>
              <Reveal>
                <h2 className="mt-16 text-2xl font-semibold tracking-[-0.01em] text-ink md:mt-20">Past events</h2>
              </Reveal>
              <EventGrid events={past} />
            </>
          )}
        </div>
      </section>

      <NewsGrid />
      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Events as a list: the date on the left, the picture, then title, place, time, a line about it and View event details. */
function EventGrid({ events }: { events: EventItem[] }) {
  return (
    <ul className="mt-6 border-t border-line">
      {events.map((e, i) => (
        <li key={e.id} id={e.id} className="scroll-mt-28 border-b border-line">
          <Reveal delay={i * 0.05} className="grid gap-6 py-10 md:grid-cols-[88px_minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
            <p className="flex items-baseline gap-3 md:block" aria-label={longDate(e.date)}>
              <span className="text-lg font-semibold uppercase tracking-[0.12em] text-ink-2">{months[Number(e.date.slice(5, 7)) - 1]}</span>
              <span aria-hidden className="my-2 hidden h-0.5 w-6 bg-line md:block" />
              <span className="text-5xl font-bold leading-none tracking-[-0.03em] text-ink">{e.date.slice(8, 10)}</span>
            </p>
            {e.image && (
              <Link href={`/events/${e.id}`} className="relative block aspect-[16/10] overflow-hidden bg-midnight">
                <Image src={e.image} alt={e.alt ?? ''} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-top transition-transform duration-700 hover:scale-[1.03]" />
              </Link>
            )}
            <div className="flex flex-col">
              <h3 className="text-2xl font-semibold leading-snug tracking-[-0.01em] text-ink">{e.title}</h3>
              <p className="mt-3 font-medium text-ink-3">{e.venue}</p>
              <p className="font-medium text-ink-3">{e.time}</p>
              <p className="no-justify mt-4 line-clamp-3 leading-relaxed text-ink-2">{e.body}</p>
              <Link href={`/events/${e.id}`} className="group mt-6 flex items-center gap-3 border-t border-line pt-5 font-semibold text-ink md:mt-auto">
                View event details <Icon name="fi-rr-arrow-small-right" className="text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
