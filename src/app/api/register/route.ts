import { NextResponse } from 'next/server';
import { submitToCrm } from '@/lib/crm';
import { registerSchema, roles } from '@/lib/register-schema';

/** Client portal access requests. Same delivery rules as /api/contact: CRM when configured, otherwise email/WhatsApp hand-off. */
export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ delivered: true });

  const [firstname, ...rest] = data.name.split(' ');
  const role = roles.find((r) => r.id === data.role)?.label;
  try {
    const delivered = await submitToCrm(
      {
        firstname,
        lastname: rest.join(' '),
        email: data.email,
        phone: data.phone,
        company: data.facility,
        jobtitle: role,
        message: `[Client portal access request] ${data.facility} · ${role}${data.systems ? ` · Systems: ${data.systems}` : ''}`,
      },
      { path: '/login?mode=register', name: 'Client portal registration' },
    );
    return NextResponse.json({ delivered });
  } catch (error) {
    console.error('[register] CRM delivery failed', error);
    return NextResponse.json({ error: 'Our system is busy. Please call +233 53 339 2863.' }, { status: 502 });
  }
}
