import { NextResponse } from 'next/server';
import { quoteSchema } from '@/lib/quote-schema';
import { siteUrl } from '@/lib/utils';

/**
 * Receives procurement requests, validates them server-side and forwards them to HubSpot
 * (Forms API) when configured. Swap `forwardToCrm` for Salesforce if Flokefama prefers it.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  // Honeypot filled: pretend success so bots learn nothing.
  if (data.website) return NextResponse.json({ reference: 'FF-OK' });

  const reference = `FF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  try {
    await forwardToCrm({ ...data, reference });
  } catch (error) {
    console.error('[quote] CRM delivery failed', error);
    return NextResponse.json({ error: 'Our system is busy. Please call +233 53 339 2863.' }, { status: 502 });
  }
  return NextResponse.json({ reference });
}

async function forwardToCrm(data: Record<string, unknown> & { reference: string; equipment: string[] }) {
  const portalId = process.env.HUBSPOT_PORTAL_ID?.trim();
  const formGuid = process.env.HUBSPOT_FORM_GUID?.trim();
  if (!portalId || !formGuid) {
    console.info('[quote] HubSpot not configured; request logged only', { reference: data.reference, facility: data.facility });
    return;
  }
  const [firstname, ...rest] = String(data.name).split(' ');
  const fields = {
    firstname,
    lastname: rest.join(' '),
    email: data.email,
    phone: data.phone,
    company: data.facility,
    jobtitle: data.role,
    message: [
      `Reference: ${data.reference}`,
      `Request: ${data.intent === 'demo' ? 'Demonstration' : 'Quotation'}`,
      `Department: ${data.department}`,
      `Equipment: ${data.equipment.join(', ')}`,
      `Timeline: ${data.timeline}`,
      data.notes ? `Notes: ${data.notes}` : '',
    ].filter(Boolean).join('\n'),
  };
  const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: Object.entries(fields).filter(([, v]) => v).map(([name, value]) => ({ name, value: String(value) })),
      context: { pageUri: `${siteUrl}/quote`, pageName: 'Procurement portal' },
    }),
  });
  if (!res.ok) throw new Error(`HubSpot responded ${res.status}`);
}
