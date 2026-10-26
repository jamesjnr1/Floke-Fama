import { NextResponse } from 'next/server';
import { submitToCrm } from '@/lib/crm';
import { emailSupport } from '@/lib/support-email';
import { clientIp, limited } from '@/lib/rate-limit';
import { requestTypes, supportSchema, supportSummary } from '@/lib/support-schema';

/**
 * Technical support requests from the Support page (Report a fault and the rest). Emailed to the support inbox (Brevo) and
 * delivered to the CRM, whichever are configured; with neither (or if both fail), the visitor sends it by email or WhatsApp.
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
  // Each provider on its own: one that fails doesn't stop the other
  const results = await Promise.allSettled([
    emailSupport(`${kind}: ${data.facility} - ${data.equipment}`, {
      'Request': kind,
      'Name': data.name,
      'Hospital or lab': data.facility,
      'Phone': data.phone,
      'Equipment': data.equipment,
      'Details': data.message,
    }, data.phone),
    submitToCrm(
      { firstname, lastname: rest.join(' '), phone: data.phone, message: `[Technical support] ${supportSummary(data)}` },
      { path: '/support', name: 'Technical support request' },
    ),
  ]);
  for (const r of results) if (r.status === 'rejected') console.error('[support] delivery failed', r.reason);
  // Not delivered (nothing configured, or the providers failed): the visitor sends it themselves by email or
  // WhatsApp, pre-filled, so the request is never lost
  return NextResponse.json({ delivered: results.some((r) => r.status === 'fulfilled' && r.value) });
}
