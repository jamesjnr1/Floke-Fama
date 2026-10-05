import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
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

      <section className="bg-canvas py-14 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-medium tracking-[-0.02em]">Upcoming events</h2>
          </Reveal>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-ink-3">There are no upcoming events right now. New dates are announced here and in the news below.</p>
          ) : (
            <EventGrid events={upcoming} />
          )}

          {past.length > 0 && (
            <>
              <Reveal>
                <h2 className="mt-16 text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-medium tracking-[-0.02em] md:mt-20">Past events</h2>
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

/** The month broken by syllable and stacked beside the day, as on the reference ("Dec / em / ber"). */
const monthParts = [['Jan', 'u', 'ary'], ['Feb', 'ru', 'ary'], ['March'], ['April'], ['May'], ['June'], ['July'], ['Au', 'gust'], ['Sep', 'tem', 'ber'], ['Oc', 'to', 'ber'], ['No', 'vem', 'ber'], ['De', 'cem', 'ber']];
const stackMonth = (date: string) => monthParts[Number(date.slice(5, 7)) - 1];

/** Events as simple cards: title, the day in large figures, the event picture, then More info. */
function EventGrid({ events }: { events: EventItem[] }) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((e, i) => {
        const day = String(Number(e.date.slice(8, 10)));
        return (
          <li key={e.id} id={e.id} className="scroll-mt-28">
            <Reveal delay={i * 0.05} className="h-full">
              <article className="flex h-full flex-col bg-paper">
                <div className="flex flex-1 flex-col justify-between gap-6 p-5">
                  <h3 className="text-base font-medium leading-snug text-ink">{e.title}</h3>
                  <p className="flex items-center gap-2" aria-label={longDate(e.date)}>
                    <span className="text-[3.5rem] font-normal leading-none tracking-[-0.04em] text-ink">{day}</span>
                    <span className="text-sm font-medium leading-[1.05] text-ink-2" aria-hidden>
                      {stackMonth(e.date).map((m) => <span key={m} className="block">{m}</span>)}
                    </span>
                  </p>
                </div>
                {e.image && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-midnight">
                    <Image src={e.image} alt={e.alt ?? ''} fill sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
                  </div>
                )}
                <Link href={`/events/${e.id}`} className="block bg-ink py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-700">
                  More info
                </Link>
              </article>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

