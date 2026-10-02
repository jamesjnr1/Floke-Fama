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
      <PageHero
        label="Events & activities"
        title={<>Moments that <span className="text-gradient">bring us together</span></>}
        lead="Celebrations, community programmes and industry events from across the Flokefama family."
      />

      <section className="bg-paper py-14 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">Upcoming</p>
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

/** The next event, given room: the full flyer beside everything a guest needs to attend. */
function FeaturedEvent({ event: e, today }: { event: EventItem; today: string }) {
  const days = daysUntil(e.date, today);
  const invite = `${contact.whatsapp.replace(/\/\d+$/, '/')}?text=${encodeURIComponent(`${e.title}: ${longDate(e.date)}, ${e.time}, ${e.venue}. ${siteUrl}/events#${e.id}`)}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`;
  return (
    <Reveal>
      <article id={e.id} className="scroll-mt-28 overflow-hidden rounded-5xl border border-line bg-canvas lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {e.image && (
          <div className="relative bg-midnight">
            <Image
              src={e.image}
              alt={e.alt ?? ''}
              width={e.imageWidth ?? 1200}
              height={e.imageHeight ?? 1200}
              sizes="(min-width: 1024px) 520px, 100vw"
              className="h-full max-h-[720px] w-full object-contain"
              priority
            />
          </div>
        )}
        <div className="flex flex-col p-6 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <DateTile date={e.date} />
            <span className="rounded-full bg-signal px-3.5 py-1.5 text-xs font-semibold text-white">
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
            </span>
          </div>
          <h3 className="display mt-6 text-[clamp(2rem,1.4rem+2vw,3rem)]">{e.title}</h3>
          {e.theme && (
            <p className="mt-4 text-lg leading-snug text-ink">
              <span className="label mr-2 !text-brand-700">Theme</span>{e.theme}
            </p>
          )}
          <p className="mt-4 max-w-xl font-light leading-relaxed text-ink-3">{e.body}</p>
          {e.more?.map((m) => <p key={m.slice(0, 24)} className="mt-2 max-w-xl text-sm font-light leading-relaxed text-ink-3">{m}</p>)}

          <dl className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {[
              { icon: 'fi-rr-calendar', label: 'Date', value: longDate(e.date) },
              { icon: 'fi-rr-clock', label: 'Time', value: e.time },
              { icon: 'fi-rr-marker', label: 'Venue', value: e.venue },
              ...(e.guests ? [{ icon: 'fi-rr-microphone', label: 'Ministering', value: e.guests }] : []),
              ...(e.price ? [{ icon: 'fi-rr-ticket', label: 'Entry', value: e.price }] : []),
            ].map((r) => (
              <div key={r.label} className="flex gap-3 bg-paper p-4">
                <Icon name={r.icon} className="mt-0.5 text-brand-600" />
                <div>
                  <dt className="text-xs text-ink-3">{r.label}</dt>
                  <dd className="text-sm font-medium text-ink">{r.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
            <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-700">
              <Icon name="fi-rr-calendar-plus" /> Add to Google Calendar
            </a>
            <a href={`/events/${e.id}/calendar`} download className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-ink/30">
              <Icon name="fi-rr-download" /> Apple / Outlook
            </a>
            <a href={invite} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink ring-1 ring-line transition hover:ring-ink/30">
              <Icon name="fi-brands-whatsapp" /> Invite on WhatsApp
            </a>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 px-2 text-sm font-medium text-brand-700 hover:text-brand-600">
              Directions <Icon name="fi-rr-arrow-small-right" />
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function PastEvent({ event: e }: { event: EventItem }) {
  return (
    <article className="overflow-hidden rounded-4xl border border-line bg-canvas md:grid md:grid-cols-2 md:items-center">
      {e.image && (
        <div className="relative aspect-[16/9] bg-midnight">
          <Image src={e.image} alt={e.alt ?? ''} fill sizes="(min-width: 768px) 640px, 100vw" className="object-contain" />
        </div>
      )}
      <div className="flex flex-col p-6 md:p-8">
        <div className="flex items-center gap-4">
          <DateTile date={e.date} />
          <h3 className="text-xl font-bold leading-snug tracking-[-0.02em]">{e.title}</h3>
        </div>
        <p className="mt-4 text-sm font-light leading-relaxed text-ink-3">{e.body}</p>
        <ul className="mt-auto flex flex-wrap gap-x-5 gap-y-1.5 pt-5 text-sm text-ink-2">
          <li className="flex items-center gap-2"><Icon name="fi-rr-clock" className="text-brand-600" /> {e.time}</li>
          <li className="flex items-center gap-2"><Icon name="fi-rr-marker" className="text-brand-600" /> {e.venue}</li>
          {e.guests && <li className="flex items-center gap-2"><Icon name="fi-rr-microphone" className="text-brand-600" /> {e.guests}</li>}
        </ul>
      </div>
    </article>
  );
}
