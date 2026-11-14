import 'server-only';
import { sendHtmlEmail, supportEmailConfigured } from '@/lib/support-email';
import { siteUrl } from '@/lib/utils';

/**
 * The site monitor's emails to the site's manager (MONITOR_REPORT_TO, set in Vercel; several addresses separated by commas): the
 * morning report and the alert when something breaks. Once MONITOR_REPORT_TO is set these go to the site's manager alone, in the
 * dashboard's own design, and the admin console's plain versions stop. Without it, nothing changes for the admins.
 */
export const ownerEmails = () =>
  (process.env.MONITOR_REPORT_TO ?? process.env.OWNER_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

export const ownerMailOn = () => ownerEmails().length > 0 && supportEmailConfigured();

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type Tile = { label: string; value: string; note?: string; tone?: 'green' | 'teal' | 'blue' | 'violet' | 'amber' | 'red' };
export type Section = { title: string; lines?: string[]; empty?: string; rows?: [string, string][] };
export interface OwnerMail {
  subject: string;
  /** The small line above the heading, e.g. the date. */
  kicker: string;
  heading: string;
  intro: string;
  /** A coloured strip under the header: 'ok' (all working) or 'alert' (something to look at). */
  status?: { kind: 'ok' | 'alert'; text: string; items?: string[] };
  tiles?: Tile[];
  sections?: Section[];
  footer: string;
}

const tones = { green: '#007a4d', teal: '#0d7f88', blue: '#2f6fae', violet: '#6554c0', amber: '#d9961c', red: '#dc2430' } as const;
const font = "'Plus Jakarta Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const numFont = `'Space Grotesk',${font}`;

/** The email as HTML (tables and inline styles, so every mail app shows it the same) and as plain text. */
export function renderOwnerMail(m: OwnerMail) {
  const tiles = m.tiles ?? [];
  const tileRows: string[] = [];
  for (let i = 0; i < tiles.length; i += 3) {
    const cells = [0, 1, 2]
      .map((j) => {
        const t = tiles[i + j];
        if (!t) return '<td width="33.33%" style="padding:6px"></td>';
        const c = tones[t.tone ?? 'green'];
        return `<td width="33.33%" valign="top" style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e1eae8;border-radius:16px"><tr><td style="padding:16px 16px 14px"><div style="width:28px;height:4px;border-radius:4px;background:${c};margin-bottom:12px"></div><div style="font:600 12px ${font};color:#56676e">${esc(t.label)}</div><div style="font:700 26px/1.1 ${numFont};color:#16232a;letter-spacing:-0.02em;margin-top:4px">${esc(t.value)}</div>${t.note ? `<div style="font:500 12px ${font};color:#56676e;margin-top:6px">${esc(t.note)}</div>` : ''}</td></tr></table></td>`;
      })
      .join('');
    tileRows.push(`<tr>${cells}</tr>`);
  }
  const status = m.status
    ? `<tr><td style="padding:0 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${m.status.kind === 'ok' ? '#e8f5ee' : '#fdecee'};border-radius:16px"><tr><td style="padding:16px 18px"><div style="font:700 15px ${font};color:${m.status.kind === 'ok' ? '#0b6b45' : '#a3172a'}">${m.status.kind === 'ok' ? '&#10003;' : '&#9888;'}&nbsp; ${esc(m.status.text)}</div>${(m.status.items ?? []).map((x) => `<div style="font:500 14px/1.5 ${font};color:#33444b;margin-top:6px">&bull; ${esc(x)}</div>`).join('')}</td></tr></table></td></tr><tr><td height="14"></td></tr>`
    : '';
  const sections = (m.sections ?? [])
    .map((s) => {
      const body = s.rows?.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${s.rows.map(([k, v], i) => `<tr><td style="padding:9px 0;font:500 14px ${font};color:#33444b;${i ? 'border-top:1px solid #edf2f1' : ''}">${esc(k)}</td><td align="right" style="padding:9px 0;font:700 14px ${numFont};color:#16232a;${i ? 'border-top:1px solid #edf2f1' : ''}">${esc(v)}</td></tr>`).join('')}</table>`
        : s.lines?.length
          ? s.lines.map((l, i) => `<div style="padding:9px 0;font:500 14px/1.5 ${font};color:#33444b;${i ? 'border-top:1px solid #edf2f1' : ''}">${esc(l)}</div>`).join('')
          : `<div style="font:500 14px ${font};color:#7d8c91">${esc(s.empty ?? 'None')}</div>`;
      return `<tr><td style="padding:0 26px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e1eae8;border-radius:16px"><tr><td style="padding:18px 20px"><div style="font:700 15px ${font};color:#16232a;margin-bottom:8px">${esc(s.title)}</div>${body}</td></tr></table></td></tr><tr><td height="14"></td></tr>`;
    })
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"></head><body style="margin:0;background:#eef5f3">
<div style="display:none;max-height:0;overflow:hidden">${esc(m.intro)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5f3"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:100%;background:#f6faf9;border-radius:24px;overflow:hidden">
<tr><td bgcolor="#075056" style="background:#075056;background-image:linear-gradient(120deg,#04402a 0%,#075056 55%,#16232a 100%);padding:30px 32px 34px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font:800 15px ${font};color:#ffffff;letter-spacing:0.08em">FLOKE FAMA</td><td align="right"><span style="display:inline-block;font:600 12px ${font};color:#ffffff;background:rgba(255,255,255,0.14);border-radius:999px;padding:5px 12px">Site monitor</span></td></tr></table>
<div style="font:600 13px ${font};color:#9fe0bf;margin-top:26px">${esc(m.kicker)}</div>
<div style="font:700 28px/1.2 ${font};color:#ffffff;letter-spacing:-0.02em;margin-top:6px">${esc(m.heading)}</div>
<div style="font:500 15px/1.55 ${font};color:#cfe3de;margin-top:10px">${esc(m.intro)}</div>
</td></tr>
<tr><td height="20"></td></tr>
${status}
${tileRows.length ? `<tr><td style="padding:0 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tileRows.join('')}</table></td></tr><tr><td height="14"></td></tr>` : ''}
${sections}
<tr><td align="center" style="padding:8px 26px 6px"><a href="${siteUrl}/monitor" style="display:inline-block;background:#007a4d;background-image:linear-gradient(135deg,#12a871,#007a4d);color:#ffffff;font:700 15px ${font};text-decoration:none;padding:14px 28px;border-radius:14px">Open the site monitor</a></td></tr>
<tr><td align="center" style="padding:16px 32px 28px;font:500 12px/1.6 ${font};color:#7d8c91">${esc(m.footer)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    m.heading, m.intro, '',
    ...(m.status ? [m.status.text, ...(m.status.items ?? []).map((x) => `- ${x}`), ''] : []),
    ...tiles.map((t) => `${t.label}: ${t.value}${t.note ? ` (${t.note})` : ''}`), '',
    ...(m.sections ?? []).flatMap((s) => [s.title, ...(s.rows?.map(([k, v]) => `  ${k}: ${v}`) ?? s.lines?.map((l) => `  ${l}`) ?? [`  ${s.empty ?? 'None'}`]), '']),
    `Open the site monitor: ${siteUrl}/monitor`,
  ].join('\n');
  return { html, text };
}

/** Sends one of the site monitor's emails to the site's manager. False when MONITOR_REPORT_TO or email isn't set up. */
export async function sendOwnerMail(m: OwnerMail) {
  if (!ownerMailOn()) return false;
  return sendHtmlEmail({ to: ownerEmails(), subject: m.subject, senderName: 'Flokefama Site monitor', ...renderOwnerMail(m) });
}
