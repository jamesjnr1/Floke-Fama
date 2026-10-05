/** Pre-filled email and WhatsApp messages: the always-working fallback when no CRM is connected. */
export function composeLinks({ to, subject, body, whatsapp }: { to: string; subject: string; body: string; whatsapp: string }) {
  return {
    email: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsapp: `${whatsapp}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`,
  };
}
