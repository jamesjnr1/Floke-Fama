import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getEvents } from '@/lib/data';
import { dateParts, daysUntil, googleCalendarUrl, longDate } from '@/lib/events';
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

      <section className="bg-canvas py-14 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-semibold tracking-[-0.02em] text-ink">Upcoming</h2>
          </Reveal>
          {upcoming.length === 0 ? (
            <p className="mt-6 rounded-3xl border border-dashed border-line bg-paper p-8 text-ink-3">There are no upcoming events right now. New dates are announced here and in the news below.</p>
          ) : (
            <div className="mt-8 space-y-8">
              {upcoming.map((e) => <FeaturedEvent key={e.id} e={e} today={today} />)}
            </div>
          )}

          {past.length > 0 && (
            <>
              <Reveal>
                <h2 className="mt-20 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-semibold tracking-[-0.02em] text-ink md:mt-24">Past events</h2>
              </Reveal>
              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {past.map((e, i) => (
                  <li key={e.id} id={e.id} className="scroll-mt-28">
                    <Reveal delay={i * 0.05} className="h-full"><PastEvent e={e} /></Reveal>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <NewsGrid />
      {jsonLd.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}

const shortDate = (date: string) => {
  const { day, month, year } = dateParts(date);
  return `${day} ${month} ${year}`;
};

/** The next event, given room: the full flyer beside everything a guest needs and the actions to come. */
function FeaturedEvent({ e, today }: { e: EventItem; today: string }) {
  const days = daysUntil(e.date, today);
  const { day, month } = dateParts(e.date);
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`;
  const details = [
    { icon: 'fi-rr-calendar', label: 'Date', value: longDate(e.date) },
    { icon: 'fi-rr-clock', label: 'Time', value: e.time },
    { icon: 'fi-rr-marker', label: 'Venue', value: e.venue },
    ...(e.guests ? [{ icon: 'fi-rr-user', label: 'Guests', value: e.guests }] : []),
  ];
  return (
    <Reveal>
      <article id={e.id} className="grid scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {e.image && (
          <Link href={`/events/${e.id}`} className="relative flex items-center justify-center bg-midnight p-6 md:p-10" aria-label={`${e.title}: details`}>
            <Image
              src={e.image}
              alt={e.alt ?? ''}
              width={e.imageWidth ?? 1200}
              height={e.imageHeight ?? 1200}
              sizes="(min-width: 1024px) 460px, 100vw"
              priority
              className="mx-auto h-auto max-h-[560px] w-auto rounded-xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]"
            />
          </Link>
        )}
        <div className="flex flex-col p-6 md:p-10 lg:p-12">
          <div className="flex items-center gap-4">
            <span className="grid w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-line text-center" aria-hidden>
              <span className="bg-signal py-1 text-xs font-semibold uppercase tracking-widest text-white">{month}</span>
              <span className="py-1.5 text-3xl font-bold leading-none tracking-[-0.03em] text-ink">{day}</span>
            </span>
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
            </span>
          </div>
          <h3 className="mt-6 text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">{e.title}</h3>
          {e.theme && <p className="mt-3 text-lg text-ink-2">Theme: <span className="font-medium text-ink">{e.theme}</span></p>}
          <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">{e.body}</p>

          <dl className="mt-8 grid gap-5 border-t border-line pt-8 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name={d.icon} /></span>
                <div className="min-w-0">
                  <dt className="text-sm text-ink-3">{d.label}</dt>
                  <dd className="font-medium leading-snug text-ink">{d.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex flex-wrap gap-2 pt-10">
            <Link href={`/events/${e.id}`} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 sm:w-auto font-semibold text-white transition hover:bg-brand-700">
              Event details <Icon name="fi-rr-arrow-small-right" />
            </Link>
            <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-line px-5 sm:flex-none font-medium text-ink transition hover:border-ink/30">
              <Icon name="fi-rr-calendar-plus" /> Add to calendar
            </a>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-line px-5 sm:flex-none font-medium text-ink transition hover:border-ink/30">
              <Icon name="fi-rr-marker" /> Directions
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/** A past event: its flyer, date, title and a line about it; the whole card opens the event. */
function PastEvent({ e }: { e: EventItem }) {
  return (
    <Link href={`/events/${e.id}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-paper transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgb(11_21_16/0.5)]">
      {e.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-midnight">
          <Image src={e.image} alt={e.alt ?? ''} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-3">
          <Icon name="fi-rr-calendar" className="text-brand-600" /> {shortDate(e.date)} · {e.time}
        </p>
        <h3 className="mt-3 text-2xl font-bold leading-snug tracking-[-0.02em] text-ink">{e.title}</h3>
        <p className="no-justify mt-3 line-clamp-3 text-base leading-relaxed text-ink-3">{e.body}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-brand-700">
          View event <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
