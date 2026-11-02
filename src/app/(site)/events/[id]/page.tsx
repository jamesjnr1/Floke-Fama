import type { Metadata } from 'next';
import Image from 'next/image';
import { EventGallery } from '@/components/events/event-gallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';
import { getEvents } from '@/lib/data';
import { daysUntil, googleCalendarUrl, longDate } from '@/lib/events';
import { siteUrl } from '@/lib/utils';

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = (await getEvents()).find((x) => x.id === id);
  return e ? { title: e.title, description: e.body, alternates: { canonical: `/events/${e.id}` } } : {};
}

/** One event: everything a guest needs, with the flyer beside it. Upcoming events add calendar, invite and directions. */
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { contact } = await getSite();
  const { id } = await params;
  const e = (await getEvents()).find((x) => x.id === id);
  if (!e) notFound();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = e.date >= today;
  const days = daysUntil(e.date, today);
  const invite = `${contact.whatsapp.replace(/\/\d+$/, '/')}?text=${encodeURIComponent(`${e.title}: ${longDate(e.date)}, ${e.time}, ${e.venue}. ${siteUrl}/events/${e.id}`)}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue)}`;

  return (
    <article className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <p className="text-sm text-ink-3">
            <Link href="/events" className="hover:text-ink">Events</Link> / {upcoming ? 'Upcoming' : 'Past event'}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-ink">{e.title}</h1>
          {e.theme && <p className="mt-3 text-lg italic text-ink-2">{e.theme}</p>}

          {/* The details as a simple list: label on the left, the detail on the right */}
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {[
              ['Date', longDate(e.date)],
              ['Time', e.time],
              ['Venue', e.venue],
              ...(e.guests ? [['Guests', e.guests]] : []),
              ...(e.price ? [['Entry', e.price]] : []),
              ...(upcoming ? [['When', days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="text-base text-ink-3">{k}</dt>
                <dd className="text-base font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink-2">
            <p>{e.body}</p>
            {e.more?.map((m) => <p key={m}>{m}</p>)}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {upcoming && (
              <>
                <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 bg-brand-600 px-5 text-base font-medium text-white hover:bg-brand-700">
                  <Icon name="fi-rr-calendar-plus" /> Add to calendar
                </a>
                <a href={`/events/${e.id}/calendar`} download className="inline-flex h-12 items-center border border-line bg-paper px-5 text-base font-medium text-ink hover:border-ink/30">
                  Apple / Outlook
                </a>
                <a href={invite} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 border border-line bg-paper px-5 text-base font-medium text-ink hover:border-ink/30">
                  <Icon name="fi-brands-whatsapp" /> Invite a friend
                </a>
                <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center px-3 text-base font-medium text-brand-700 hover:underline">
                  Directions
                </a>
              </>
            )}
            {!upcoming && e.photos?.length ? (
              <a href="#event-photos" className="inline-flex h-12 items-center gap-2 bg-brand-600 px-5 text-base font-medium text-white hover:bg-brand-700">
                <Icon name="fi-rr-camera" /> See the photos ({e.photos.length})
              </a>
            ) : null}
            <Link href="/events" className="inline-flex h-12 items-center gap-2 border border-line bg-paper px-5 text-base font-medium text-ink hover:border-ink/30">
              All events
            </Link>
          </div>
        </div>

        {e.image && (
          <figure className="lg:sticky lg:top-[calc(var(--banner)+4.5rem)] lg:self-start">
            <Image src={e.image} alt={e.alt ?? ''} width={e.imageWidth ?? 1200} height={e.imageHeight ?? 1200} sizes="(min-width: 1024px) 45vw, 100vw" priority className="h-auto w-full rounded-lg" />
          </figure>
        )}
      </div>

      {/* Photos from the event, once there are some */}
      {e.photos?.length ? (
        <section id="event-photos" aria-labelledby="event-photos-title" className="mx-auto mt-14 max-w-[1280px] scroll-mt-32 px-5 md:mt-20 md:px-10">
          <h2 id="event-photos-title" className="mb-5 text-2xl font-semibold tracking-[-0.01em] text-ink">Photos from the event</h2>
          <EventGallery photos={e.photos} title={e.title} />
        </section>
      ) : null}
    </article>
  );
}
