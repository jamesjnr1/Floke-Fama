import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getEvents } from '@/lib/data';
import { longDate } from '@/lib/events';
import type { EventItem } from '@/lib/types';
import { cn, siteUrl } from '@/lib/utils';

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
      <SitePageHero page="events" />

      <section className="bg-paper section-y">
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
      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dateParts = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return { weekday: weekdays[d.getUTCDay()], day: d.getUTCDate(), month: `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}` };
};

/**
 * Events as a clean list of rows: the day on the left, then the time and place, then the event with its
 * picture. The next upcoming event's date is picked out in red; past events sit on a faint striped
 * background. A month label starts each new month.
 */
function EventGrid({ events, past = false }: { events: EventItem[]; past?: boolean }) {
  return (
    <ul className="mt-6 space-y-3">
      {events.map((e, i) => {
        const d = dateParts(e.date);
        const newMonth = i === 0 || dateParts(events[i - 1].date).month !== d.month;
        return (
          <li key={e.id} id={e.id} className="scroll-mt-28">
            {newMonth && <p className={cn('pb-3 text-base font-semibold text-ink-2', i > 0 && 'pt-6')}>{d.month}</p>}
            <Reveal delay={Math.min(i, 5) * 0.04}>
              <Link
                href={`/events/${e.id}`}
                className={cn(
                  'group grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-5 gap-y-4 rounded-lg border p-5 transition md:grid-cols-[96px_minmax(0,19rem)_minmax(0,1fr)_auto] md:gap-x-8 md:px-8',
                  past
                    ? 'border-transparent bg-[repeating-linear-gradient(135deg,rgb(11_21_16/0.035)_0_14px,transparent_14px_28px)] bg-canvas hover:border-line'
                    : 'border-line bg-paper hover:border-ink/25 hover:shadow-[0_20px_40px_-32px_rgb(11_21_16/0.4)]',
                )}
                aria-label={`${e.title}, ${longDate(e.date)}`}
              >
                <span className="row-span-2 border-r border-line pr-5 text-center md:row-span-1 md:pr-8">
                  <span className={cn('block text-lg', !past && i === 0 ? 'text-signal' : 'text-ink-2')}>{d.weekday}</span>
                  <span className={cn('block text-[2.75rem] font-medium leading-none tracking-[-0.02em]', !past && i === 0 ? 'text-signal' : 'text-ink')}>{d.day}</span>
                </span>
                <span className="min-w-0 space-y-2 text-[0.9375rem] text-ink-2">
                  <span className="flex items-center gap-2.5">
                    <Icon name="fi-rr-clock" className="shrink-0 text-ink-3" /> <span className="truncate">{e.time}</span>
                  </span>
                  <span className="flex items-center gap-2.5" title={e.venue}>
                    <Icon name="fi-rr-marker" className="shrink-0 text-ink-3" /> <span className="truncate">{e.venue}</span>
                  </span>
                </span>
                <span className="col-start-2 flex min-w-0 items-center gap-4 md:col-start-auto">
                  {e.image && (
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-midnight">
                      <Image src={e.image} alt="" fill sizes="48px" className="object-cover object-top" />
                    </span>
                  )}
                  <span className="min-w-0 font-medium leading-snug text-ink">{e.title}</span>
                </span>
                <Icon name="fi-rr-arrow-small-right" className="hidden text-xl text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-ink md:block" />
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
