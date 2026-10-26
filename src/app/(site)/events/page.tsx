import type { Metadata } from 'next';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getEvents } from '@/lib/data';
import { longDate } from '@/lib/events';
import type { EventItem } from '@/lib/types';
import { cn, siteUrl, jsonLdHtml } from '@/lib/utils';

// Re-render daily so events move from Upcoming to Past, and the countdown stays right.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Events & News',
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
      <SitePageHero page="events" />

      <section className="pattern-grid bg-paper section-y">
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
              <EventGrid events={past} past />
            </>
          )}
        </div>
      </section>

      <NewsGrid />
      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />}
    </>
  );
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dateParts = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return { month: months[d.getUTCMonth()], day: d.getUTCDate(), year: d.getUTCFullYear(), label: `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}` };
};

/**
 * Events as a calendar of cards: a picture on the left (a placeholder until the event photos arrive), then the
 * time, the event and a short description, and the date on the right (month, day, year).
 */
function EventGrid({ events, past = false }: { events: EventItem[]; past?: boolean }) {
  return (
    <ul className="mt-6 space-y-3">
      {events.map((e, i) => {
        const d = dateParts(e.date);
        const newMonth = i === 0 || dateParts(events[i - 1].date).label !== d.label;
        return (
          <li key={e.id} id={e.id} className="scroll-mt-28">
            {newMonth && <p className={cn('pb-3 text-base font-semibold text-ink-2', i > 0 && 'pt-6')}>{d.label}</p>}
            <Reveal delay={Math.min(i, 5) * 0.04}>
              <Link
                href={`/events/${e.id}`}
                aria-label={`${e.title}, ${longDate(e.date)}`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-lg border border-line bg-paper p-4 transition hover:border-ink/25 hover:shadow-[0_20px_40px_-32px_rgb(11_21_16/0.4)] sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-6 md:grid-cols-[13rem_minmax(0,1fr)_auto] md:gap-8 md:p-5"
              >
                {/* Placeholder until the event photos arrive */}
                <span aria-hidden className="col-span-2 grid aspect-[16/9] place-items-center bg-mist text-ink-3 sm:col-span-1 sm:aspect-[4/3.6]">
                  <span className="flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]">
                    <Icon name="fi-rr-camera" className="text-2xl" /> Photo to come
                  </span>
                </span>
                <span className="flex min-w-0 flex-col justify-center py-1">
                  <span className="flex items-center gap-2 text-[0.9375rem] text-ink-2"><Icon name="fi-rr-clock" className="shrink-0 text-ink-3" /> {e.time}</span>
                  <span className="mt-2 text-[clamp(1.25rem,1.1rem+0.5vw,1.625rem)] font-bold leading-snug tracking-[-0.02em] text-ink">{e.title}</span>
                  <span className="no-justify mt-2 line-clamp-2 text-base leading-relaxed text-ink-3">{e.body}</span>
                  <span className="mt-3 flex items-center gap-2 text-sm text-ink-3">
                    <Icon name="fi-rr-marker" className="shrink-0" /> <span className="truncate">{e.venue}</span>
                  </span>
                </span>
                <span className="flex min-w-[5.5rem] flex-col items-center justify-center border-l border-line pl-4 text-center sm:pl-6 md:min-w-[8rem] md:pl-8">
                  <span className="text-lg text-ink-2 md:text-2xl">{d.month}</span>
                  <span className={cn('text-[2.75rem] font-bold leading-none tracking-[-0.03em] md:text-[3.75rem]', !past && i === 0 ? 'text-signal' : 'text-ink')}>{d.day}</span>
                  <span className="text-lg text-ink-2 md:text-2xl">{d.year}</span>
                </span>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
