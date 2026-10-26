import { NextResponse } from 'next/server';
import { submitToCrm } from '@/lib/crm';
import { clientIp, limited } from '@/lib/rate-limit';
import { supportSchema, supportSummary } from '@/lib/support-schema';

/** Technical support requests from the Support page. CRM when configured, otherwise email/WhatsApp hand-off. */
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
  try {
    const delivered = await submitToCrm(
      { firstname, lastname: rest.join(' '), phone: data.phone, message: `[Technical support] ${supportSummary(data)}` },
      { path: '/support', name: 'Technical support request' },
    );
    return NextResponse.json({ delivered });
  } catch (error) {
    console.error('[support] CRM delivery failed', error);
    return NextResponse.json({ error: 'Our system is busy. Please call +233 53 339 2863.' }, { status: 502 });
  }
}
