import { NextResponse } from 'next/server';
import { contactSchema, topics } from '@/lib/contact-schema';
import { submitToCrm } from '@/lib/crm';

/** "Get in touch" enquiries. Same delivery rules as /api/quote: CRM when configured, otherwise email/WhatsApp hand-off. */
export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ delivered: true });

  const [firstname, ...rest] = data.name.split(' ');
  try {
    const delivered = await submitToCrm(
      {
        firstname,
        lastname: rest.join(' '),
        email: data.email || undefined,
        phone: data.phone,
        message: `[${topics.find((t) => t.id === data.topic)?.label}] ${data.message}`,
      },
      { path: '/contact', name: 'Get in touch' },
    );
    return NextResponse.json({ delivered });
  } catch (error) {
    console.error('[contact] CRM delivery failed', error);
    return NextResponse.json({ error: 'Our system is busy. Please call +233 53 339 2863.' }, { status: 502 });
  }
}
