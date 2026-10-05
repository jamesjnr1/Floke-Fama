'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import type { EventItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Events under two tabs, Upcoming and Past, as small picture cards. */
export function EventTabs({ upcoming, past }: { upcoming: EventItem[]; past: EventItem[] }) {
  const [tab, setTab] = useState<'upcoming' | 'past'>(upcoming.length ? 'upcoming' : 'past');
  const list = tab === 'upcoming' ? upcoming : past;
  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: upcoming.length },
    { id: 'past' as const, label: 'Past events', count: past.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Events" className="flex gap-6 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn('relative pb-3 text-base transition-colors', tab === t.id ? 'font-semibold text-ink' : 'text-ink-3 hover:text-ink')}
          >
            {t.label} <span className="ml-1 text-sm text-ink-3">({t.count})</span>
            {tab === t.id && <motion.span layoutId="event-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-6">
        {list.length === 0 ? (
          <p className="text-ink-3">{tab === 'upcoming' ? 'No upcoming events right now. New dates are announced here.' : 'No past events yet.'}</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => {
              const [, m, d] = e.date.split('-');
              const place = e.venue.split(',').pop()?.trim();
              return (
                <li key={e.id} id={e.id} className="scroll-mt-28">
                  <Link href={`/events/${e.id}`} className="group block overflow-hidden rounded-2xl border border-line bg-paper transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-32px_rgb(11_21_16/0.45)]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-midnight">
                      {e.image && <Image src={e.image} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />}
                      <span className="absolute left-3 top-3 grid min-w-12 rounded-lg bg-paper px-2 py-1.5 text-center leading-none shadow-sm">
                        <span className="text-lg font-bold text-ink">{Number(d)}</span>
                        <span className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-signal">{months[Number(m) - 1]}</span>
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-semibold leading-snug text-ink group-hover:text-brand-700">{e.title}</h3>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-3">
                        <Icon name="fi-rr-clock" className="text-xs" /> {e.time.split('–')[0].trim()}
                        <span aria-hidden>·</span>
                        <Icon name="fi-rr-marker" className="text-xs" /> <span className="truncate">{place}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
