import { NextResponse } from 'next/server';
import { pushToEngineers } from '@/lib/push';
import { smsWebsiteFault } from '@/lib/sms';
import { emailSales, emailSupport } from '@/lib/support-email';
import { saveSupportRequest, setSupportStatus } from '@/lib/support-requests';
import { autoBookVisit } from '@/lib/service/server';
import { clientIp, limited } from '@/lib/rate-limit';
import { requestTypes, supportDetails, supportSchema, supportSubject } from '@/lib/support-schema';

/**
 * Technical support requests from the Support page (Report a fault and the rest). Saved for the admin console
 * (Appwrite), emailed to the support inbox (Brevo; a demonstration request to sales too), a fault texted to the
 * engineers (SMS), whichever are configured; with neither (or if both fail), the visitor sends it by email or WhatsApp.
 */
export async function POST(request: Request) {
  // Up to 5 requests per visitor every 10 minutes: plenty for a real fault, too few to flood the support inbox
  if (limited(`support:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'You’ve sent several requests in a short time. Please call +233 53 339 2863 if it’s urgent.' }, { status: 429 });
  }
  const parsed = supportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ delivered: true });

  const kind = requestTypes.find((t) => t.id === data.type)?.label ?? 'Support request';
  // Saved first, so the reference goes into the email and the text
  const saved = await saveSupportRequest(data).catch((e) => {
    console.error('[support] not saved', e);
    return null;
  });
  const ref = saved ? ` (${saved})` : '';
  // Not working at all: a critical service request at once, linked to this request (engineers still call back first)
  const job = saved
    ? await autoBookVisit(saved, data).catch((e) => {
        console.error('[support] visit not booked automatically', e);
        return undefined;
      })
    : undefined;
  if (saved && job) await setSupportStatus(saved, 'new', 'Booked automatically', job).catch((e) => console.error('[support] job not linked', e));
  // Each channel on its own: one that fails doesn't stop the others
  const results = await Promise.allSettled([
    emailSupport(`${kind}: ${data.facility} - ${supportSubject(data)}${ref}`, {
      'Request': kind,
      ...(saved ? { 'Reference': saved } : {}),
      'Name': data.name,
      'Hospital or lab': data.facility,
      'Phone': data.phone,
      ...Object.fromEntries(supportDetails(data)),
    }, data.phone),
    // A demonstration is a sales lead: the sales inbox hears about it too
    data.type === 'assistance' && data.topic === 'demo'
      ? emailSales(`Demonstration request: ${data.facility} - ${supportSubject(data)}${ref}`, {
          ...(saved ? { 'Reference': saved } : {}),
          'Name': data.name,
          'Hospital or lab': data.facility,
          'Phone': data.phone,
          ...Object.fromEntries(supportDetails(data)),
        }, { phone: data.phone })
      : Promise.resolve(false),
    // Engineers hear about it on their phones: a text for a fault, a portal alert for every request
    saved ? smsWebsiteFault({ reference: saved, job, ...data }).then(() => false) : Promise.resolve(false),
    saved
      ? pushToEngineers({ body: `${kind} from ${data.facility}: ${supportSubject(data)}${data.working === 'down' ? ' (not working at all)' : ''}. Call ${data.name} back.`, url: `/engineer?website=${saved}`, tag: saved }).then(() => false)
      : Promise.resolve(false),
  ]);
  for (const r of results) if (r.status === 'rejected') console.error('[support] delivery failed', r.reason);
  // Not delivered (nothing configured, or every channel failed): the visitor sends it themselves by email or
  // WhatsApp, pre-filled, so the request is never lost
  const delivered = Boolean(saved) || results.some((r) => r.status === 'fulfilled' && r.value);
  return NextResponse.json({ delivered, reference: saved ?? undefined, job });
}
