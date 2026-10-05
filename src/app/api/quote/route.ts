import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { submitToCrm } from '@/lib/crm';
import { quoteSchema, type QuoteInput } from '@/lib/quote-schema';

/**
 * Receives procurement requests, validates them server-side and forwards them to HubSpot
 * (Forms API) when configured. Without a CRM it answers `delivered: false`, and the page
 * hands the request to the visitor's email or WhatsApp, so no request is ever lost.
 */
export async function POST(request: Request) {
  // Quote and order requests need a signed-in account.
  if (!(await getSession())) return NextResponse.json({ error: 'Please sign in to send a request.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  // Honeypot filled: pretend success so bots learn nothing.
  if (data.website) return NextResponse.json({ reference: 'FF-OK', delivered: true });

  const reference = `FF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  try {
    const delivered = await submitToCrm(crmFields(data, reference), { path: '/quote', name: 'Procurement portal' });
    return NextResponse.json({ reference, delivered });
  } catch (error) {
    console.error('[quote] CRM delivery failed', error);
    return NextResponse.json({ error: 'Our system is busy. Please call +233 53 339 2863.' }, { status: 502 });
  }
}

function crmFields(data: QuoteInput, reference: string) {
  const [firstname, ...rest] = data.name.split(' ');
  return {
    firstname,
    lastname: rest.join(' '),
    email: data.email,
    phone: data.phone,
    company: data.facility,
    jobtitle: data.role,
    message: [
      `Reference: ${reference}`,
      `Request: ${data.intent === 'demo' ? 'Demonstration' : 'Quotation'}`,
      `Department: ${data.department}`,
      `Equipment: ${data.equipment.join(', ')}`,
      `Timeline: ${data.timeline}`,
      data.notes ? `Notes: ${data.notes}` : '',
    ].filter(Boolean).join('\n'),
  };
}
