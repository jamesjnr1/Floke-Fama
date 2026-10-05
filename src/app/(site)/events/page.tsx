import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Icon } from '@/components/ui/icon';
import { getEvents } from '@/lib/data';
import { dateParts, daysUntil, longDate } from '@/lib/events';
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

      <section className="bg-canvas py-12 md:py-16">
        <div className="mx-auto max-w-[960px] px-5 md:px-10">
          <h2 className="text-xl font-semibold text-ink">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-ink-3">No upcoming events right now. New dates are announced here.</p>
          ) : (
            <ul className="mt-4 space-y-3">{upcoming.map((e) => <EventRow key={e.id} e={e} today={today} />)}</ul>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mt-10 text-xl font-semibold text-ink">Past events</h2>
              <ul className="mt-4 space-y-3">{past.map((e) => <EventRow key={e.id} e={e} today={today} />)}</ul>
            </>
          )}
        </div>
      </section>

      <NewsGrid />
      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}

/** One event as a single compact row: thumbnail, date, title, time and place. The row opens the event. */
function EventRow({ e, today }: { e: EventItem; today: string }) {
  const { day, month } = dateParts(e.date);
  const days = daysUntil(e.date, today);
  return (
    <li id={e.id} className="scroll-mt-28">
      <Link href={`/events/${e.id}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-paper p-3 pr-5 transition hover:border-ink/20">
        {e.image && (
          <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-midnight sm:block">
            <Image src={e.image} alt="" fill sizes="96px" className="object-cover" />
          </span>
        )}
        <span className="grid w-12 shrink-0 text-center leading-none" aria-hidden>
          <span className="text-xs font-semibold uppercase tracking-wider text-signal">{month}</span>
          <span className="mt-1 text-2xl font-bold text-ink">{day}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-semibold leading-snug text-ink group-hover:text-brand-700 sm:line-clamp-1">{e.title}</span>
          <span className="mt-0.5 block truncate text-sm text-ink-3">
            <span className="sr-only">{longDate(e.date)}, </span>
            {e.time} · {e.venue}
          </span>
        </span>
        {days >= 0 && <span className="hidden shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 md:inline">{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}</span>}
        <Icon name="fi-rr-arrow-small-right" className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </Link>
    </li>
  );
}
