import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { submitToCrm } from '@/lib/crm';
import { createQuoteDeal, hubspotConfigured } from '@/lib/hubspot';
import { departments, quoteSchema, timelines, type QuoteInput } from '@/lib/quote-schema';

/**
 * Receives procurement requests, validates them server-side and forwards them to HubSpot when configured:
 * as a deal with its contact and hospital (service key, HUBSPOT_ACCESS_TOKEN), or through a HubSpot form. Without a CRM it answers `delivered: false`, and the page
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
    const delivered = hubspotConfigured()
      ? Boolean(await createQuoteDeal(dealFields(data, reference)))
      : await submitToCrm(crmFields(data, reference), { path: '/quote', name: 'Procurement portal' });
    return NextResponse.json({ reference, delivered });
  } catch (error) {
    // HubSpot down or misconfigured: the page hands the request to the visitor's email or WhatsApp instead
    console.error('[quote] CRM delivery failed', error);
    return NextResponse.json({ reference, delivered: false });
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

function dealFields(data: QuoteInput, reference: string) {
  return {
    reference,
    intent: data.intent,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role || undefined,
    facility: data.facility,
    department: departments.find((d) => d.id === data.department)?.label ?? data.department,
    equipment: data.equipment,
    timeline: timelines.find((t) => t.id === data.timeline)?.label ?? data.timeline,
    // Urgent buyers first in HubSpot's deal views
    priority: data.timeline === 'urgent' ? 'HIGH' : data.timeline === 'quarter' ? 'MEDIUM' : 'LOW',
    notes: data.notes || undefined,
  } as const;
}
