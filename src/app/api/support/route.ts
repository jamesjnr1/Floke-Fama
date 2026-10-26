import { NextResponse } from 'next/server';
import { submitToCrm } from '@/lib/crm';
import { smsWebsiteFault } from '@/lib/sms';
import { emailSupport } from '@/lib/support-email';
import { saveSupportRequest } from '@/lib/support-requests';
import { clientIp, limited } from '@/lib/rate-limit';
import { requestTypes, supportSchema, supportSummary } from '@/lib/support-schema';

/**
 * Technical support requests from the Support page (Report a fault and the rest). Saved for the admin console
 * (Appwrite), emailed to the support inbox (Brevo), a fault texted to the engineers (SMS), and delivered to the CRM, whichever are configured; with neither (or if both fail), the visitor sends it by email or WhatsApp.
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

  const [firstname, ...rest] = data.name.split(' ');
  const kind = requestTypes.find((t) => t.id === data.type)?.label ?? 'Support request';
  // Saved first, so the reference goes into the email and the text
  const saved = await saveSupportRequest(data).catch((e) => {
    console.error('[support] not saved', e);
    return null;
  });
  const ref = saved ? ` (${saved})` : '';
  // Each channel on its own: one that fails doesn't stop the others
  const results = await Promise.allSettled([
    emailSupport(`${kind}: ${data.facility} - ${data.equipment}${ref}`, {
      'Request': kind,
      ...(saved ? { 'Reference': saved } : {}),
      'Name': data.name,
      'Hospital or lab': data.facility,
      'Phone': data.phone,
      'Equipment': data.equipment,
      'Details': data.message,
    }, data.phone),
    submitToCrm(
      { firstname, lastname: rest.join(' '), phone: data.phone, message: `[Technical support${ref}] ${supportSummary(data)}` },
      { path: '/support', name: 'Technical support request' },
    ),
    saved ? smsWebsiteFault({ reference: saved, ...data }).then(() => false) : Promise.resolve(false),
  ]);
  for (const r of results) if (r.status === 'rejected') console.error('[support] delivery failed', r.reason);
  // Not delivered (nothing configured, or every channel failed): the visitor sends it themselves by email or
  // WhatsApp, pre-filled, so the request is never lost
  const delivered = Boolean(saved) || results.some((r) => r.status === 'fulfilled' && r.value);
  return NextResponse.json({ delivered, reference: saved ?? undefined });
}
