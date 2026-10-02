import type { EventItem } from '@/lib/types';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parts for the calendar-page date tile. */
export function dateParts(date: string) {
  const [y, m, d] = date.split('-');
  return { day: String(Number(d)), month: months[Number(m) - 1], year: y };
}

export const longDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Whole days from `today` (YYYY-MM-DD) to the event; 0 means today. */
export const daysUntil = (date: string, today: string) => Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const endOf = (e: EventItem) => e.end ?? new Date(Date.parse(e.start) + 3 * 3_600_000).toISOString();

export function googleCalendarUrl(e: EventItem) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(endOf(e))}`,
    details: [e.body, e.theme && `Theme: ${e.theme}`, e.guests && `With ${e.guests}`].filter(Boolean).join('\n'),
    location: e.venue,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** An .ics file that Apple Calendar, Outlook and Google Calendar can all open. */
export function icsFile(e: EventItem, url: string) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flokefama//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@flokefama`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(endOf(e))}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs([e.body, e.theme && `Theme: ${e.theme}`, e.guests && `With ${e.guests}`, url].filter(Boolean).join('\n'))}`,
    `LOCATION:${escapeIcs(e.venue)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
