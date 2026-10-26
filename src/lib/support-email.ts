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

/**
 * A live check for the admin console (no email is sent): is the key accepted from this server, and is the sender
 * confirmed in Brevo? Returns the reason in plain words when something is wrong.
 */
export async function brevoStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!key()) return { ok: false, detail: 'BREVO_API_KEY is not set on this deployment (add it in Vercel, then redeploy).' };
  if (!sender()) return { ok: false, detail: 'BREVO_SENDER_EMAIL is not set on this deployment (add it in Vercel, then redeploy).' };
  const get = (path: string) => fetch(`https://api.brevo.com/v3/${path}`, { headers: { Accept: 'application/json', 'api-key': key()! }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  try {
    const account = await get('account');
    if (!account.ok) {
      const message = ((await account.json().catch(() => ({}))) as { message?: string }).message ?? `error ${account.status}`;
      if (/ip address/i.test(message))
        return { ok: false, detail: `Brevo is blocking this server’s address. In Brevo → Security → Authorised IPs, turn off “blocking unknown IP addresses” (Vercel’s addresses change). Brevo said: ${message}` };
      return { ok: false, detail: `Brevo did not accept the API key: ${message}. Check BREVO_API_KEY (an API key, not an SMTP key).` };
    }
    const { senders = [] } = (await (await get('senders')).json().catch(() => ({}))) as { senders?: { email: string; active?: boolean }[] };
    const s = senders.find((x) => x.email.toLowerCase() === sender()!.toLowerCase());
    if (!s) return { ok: false, detail: `${sender()} is not a sender in Brevo. Add it in Brevo → Senders and click the link in the confirmation email.` };
    if (s.active === false) return { ok: false, detail: `${sender()} is not confirmed yet in Brevo. Click the link in Brevo’s confirmation email.` };
    return { ok: true, detail: `Connected. Report a fault and the other support requests are emailed from ${sender()} to ${recipients().join(', ')}.` };
  } catch {
    return { ok: false, detail: 'Brevo could not be reached from this server. Try again in a minute.' };
  }
}
