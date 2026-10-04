import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/layout/page-hero';
import { NewsGrid } from '@/components/media/news-grid';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
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
      <PageHero image="/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-1.webp" imagePosition="50% 40%"
        label="Events & activities"
        title={<>Moments that <span className="text-brand-600">bring us together</span></>}
        lead="Celebrations, community programmes and industry events from across the Flokefama family."
      />

      <section className="bg-paper py-14 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label eyebrow">Upcoming</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">What’s next.</h2>
          </Reveal>
          {upcoming.length === 0 ? (
            <Reveal delay={0.06}>
              <p className="mt-8 flex items-center gap-3 rounded-3xl border border-dashed border-line bg-canvas p-6 text-ink-3">
                <Icon name="fi-rr-calendar" className="text-brand-600" /> There are no upcoming events right now. New dates are announced here and in the news below.
              </p>
            </Reveal>
          ) : (
            <div className="mt-8 space-y-6">
              {upcoming.map((e) => <FeaturedEvent key={e.id} event={e} today={today} />)}
            </div>
          )}

          {past.length > 0 && (
            <>
              <Reveal>
                <p className="label mt-16 md:mt-20">Past events</p>
              </Reveal>
              <ul className="mt-6 space-y-4">
                {past.map((e, i) => (
                  <li key={e.id} id={e.id} className="scroll-mt-28">
                    <Reveal delay={i * 0.05} className="h-full"><PastEvent event={e} /></Reveal>
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

function DateTile({ date }: { date: string }) {
  const { day, month, year } = dateParts(date);
  return (
    <div className="w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-paper text-center shadow-[0_10px_24px_-16px_rgb(11_21_16/0.35)]" aria-label={`${day} ${month} ${year}`}>
      <p className="bg-brand-600 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white">{month}</p>
      <p className="pt-2.5 text-[34px] font-bold leading-none tracking-[-0.03em] text-ink">{day}</p>
      <p className="pb-2.5 pt-1 font-mono text-[11px] text-ink-3">{year}</p>
    </div>
  );
}

/** The next event: a compact card with the flyer as a thumbnail and everything a guest needs to attend. */
function FeaturedEvent({ event: e, today }: { event: EventItem; today: string }) {
  const days = daysUntil(e.date, today);
  const invite = `${contact.whatsapp.replace(/\/\d+$/, '/')}?text=${encodeURIComponent(`${e.title}: ${longDate(e.date)}, ${e.time}, ${e.venue}. ${siteUrl}/events#${e.id}`)}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`;
  return (
    <Reveal>
      <article id={e.id} className="scroll-mt-28 flex flex-col gap-6 rounded-4xl border border-line bg-canvas p-4 sm:flex-row sm:items-center md:gap-8 md:p-5">
        {e.image && (
          <a href={e.image} target="_blank" rel="noopener noreferrer" className="block shrink-0 self-center sm:self-auto" aria-label={`Open the ${e.title} flyer`}>
            <Image
              src={e.image}
              alt={e.alt ?? ''}
              width={e.imageWidth ?? 1200}
              height={e.imageHeight ?? 1200}
              sizes="220px"
              className="h-auto w-[180px] rounded-2xl shadow-[0_16px_32px_-18px_rgb(11_21_16/0.5)] md:w-[220px]"
            />
          </a>
        )}
        <div className="min-w-0 flex-1 pr-1 md:py-2 md:pr-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-signal px-3 py-1 text-xs font-semibold text-white">
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
            </span>
            {e.price && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{e.price}</span>}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <DateTile date={e.date} />
            <div className="min-w-0">
              <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">{e.title}</h3>
              {e.theme && <p className="mt-1 text-ink-2">{e.theme}</p>}
            </div>
          </div>
          <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm text-ink-2 sm:grid-cols-2">
            <li className="flex items-start gap-2"><Icon name="fi-rr-clock" className="mt-0.5 text-brand-600" /> {longDate(e.date).split(',')[0]}, {e.time}</li>
            <li className="flex items-start gap-2"><Icon name="fi-rr-marker" className="mt-0.5 text-brand-600" /> {e.venue}</li>
            {e.guests && <li className="flex items-start gap-2 sm:col-span-2"><Icon name="fi-rr-microphone" className="mt-0.5 text-brand-600" /> {e.guests}</li>}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
              <Icon name="fi-rr-calendar-plus" /> Add to calendar
            </a>
            <a href={`/events/${e.id}/calendar`} download className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-ink/30">
              Apple / Outlook
            </a>
            <a href={invite} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-ink/30">
              <Icon name="fi-brands-whatsapp" /> Invite
            </a>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1 px-2 text-sm font-medium text-brand-700 hover:text-brand-600">
              Directions
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function PastEvent({ event: e }: { event: EventItem }) {
  return (
    <article className="flex flex-col gap-5 rounded-4xl border border-line bg-canvas p-4 sm:flex-row sm:items-center md:p-5">
      {e.image && (
        <Image src={e.image} alt={e.alt ?? ''} width={e.imageWidth ?? 1200} height={e.imageHeight ?? 1200} sizes="260px" className="h-auto w-full shrink-0 rounded-2xl sm:w-[260px]" />
      )}
      <div className="min-w-0 flex-1 md:pr-4">
        <p className="label">{longDate(e.date)}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-[-0.02em]">{e.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">{e.body}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-2">
          <li className="flex items-center gap-2"><Icon name="fi-rr-clock" className="text-brand-600" /> {e.time}</li>
          <li className="flex items-center gap-2"><Icon name="fi-rr-marker" className="text-brand-600" /> {e.venue}</li>
          {e.guests && <li className="flex items-center gap-2"><Icon name="fi-rr-microphone" className="text-brand-600" /> {e.guests}</li>}
        </ul>
      </div>
    </article>
  );
}
