import { getEvents } from '@/lib/data';
import { icsFile } from '@/lib/events';
import { siteUrl } from '@/lib/utils';

/** “Add to calendar” for Apple Calendar and Outlook: /events/<id>/calendar downloads an .ics invite. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = (await getEvents()).find((e) => e.id === id);
  if (!event) return new Response('Event not found', { status: 404 });
  return new Response(icsFile(event, `${siteUrl}/events#${event.id}`), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.id}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
