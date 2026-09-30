import { contact } from '@/data/seed';

/** Pre-filled email and WhatsApp messages: the always-working fallback when no CRM is connected. */
export function composeLinks({ to, subject, body }: { to: string; subject: string; body: string }) {
  return {
    email: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsapp: `${contact.whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`,
  };
}
