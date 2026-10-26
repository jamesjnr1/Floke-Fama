import 'server-only';

/**
 * Support requests by email, through Brevo (brevo.com, free for up to 300 emails a day). Set BREVO_API_KEY
 * (Brevo → SMTP & API → API keys) and the sender, BREVO_SENDER_EMAIL: an address confirmed in Brevo → Senders
 * (one click in a confirmation email, no website or DNS changes). Requests go to SUPPORT_EMAIL_TO
 * (comma-separated; default: the sender). Without the key this does nothing and returns false.
 */
const key = () => process.env.BREVO_API_KEY?.trim();
const sender = () => process.env.BREVO_SENDER_EMAIL?.trim();
const recipients = () => (process.env.SUPPORT_EMAIL_TO?.trim() || sender() || '').split(',').map((e) => e.trim()).filter(Boolean);

export const supportEmailConfigured = () => Boolean(key() && sender());

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Emails one request: the fields as a table (and as plain text), with the caller's phone as a tap-to-call link. */
export async function emailSupport(subject: string, fields: Record<string, string>, phone?: string) {
  if (!supportEmailConfigured()) return false;
  const rows = Object.entries(fields)
    .map(([k, v]) => {
      const value = k === 'Phone' && phone ? `<a href="tel:${escape(phone.replace(/[^\d+]/g, ''))}">${escape(v)}</a>` : escape(v).replace(/\n/g, '<br>');
      return `<tr><td style="padding:8px 16px 8px 0;color:#5b6b66;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="padding:8px 0;color:#16232a">${value}</td></tr>`;
    })
    .join('');
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'api-key': key()! },
    body: JSON.stringify({
      sender: { name: 'Flokefama website', email: sender() },
      to: recipients().map((email) => ({ email })),
      subject,
      htmlContent: `<div style="font-family:Arial,sans-serif;font-size:15px"><p style="margin:0 0 12px;font-size:17px;font-weight:bold;color:#0a5a33">${escape(subject)}</p><table style="border-collapse:collapse">${rows}</table><p style="margin-top:20px;color:#5b6b66;font-size:13px">Sent from the Report a fault form on the Flokefama website.</p></div>`,
      textContent: `${subject}\n\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  return true;
}
