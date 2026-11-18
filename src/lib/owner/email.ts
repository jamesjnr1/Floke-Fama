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

export type Tile = { label: string; value: string; note?: string };
export type Section = { title: string; lines?: string[]; empty?: string; rows?: [string, string][] };
export interface OwnerMail {
  subject: string;
  /** The small line above the heading, e.g. the date. */
  kicker: string;
  heading: string;
  intro: string;
  /** A line with a green ('ok') or red ('alert') mark beside it: all working, or what to look at. */
  status?: { kind: 'ok' | 'alert'; text: string; items?: string[] };
  tiles?: Tile[];
  sections?: Section[];
  footer: string;
}

const font = "'Plus Jakarta Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const numFont = `'Space Grotesk',${font}`;
const line = 'border-top:1px solid #e6ecea';

/**
 * The email as HTML and as plain text. Kept plain on purpose: a white page, the name in green, a heading, the facts
 * in simple lines and one button. Tables and inline styles, so every mail app shows it the same.
 */
export function renderOwnerMail(m: OwnerMail) {
  const tiles = m.tiles ?? [];
  const tileRows: string[] = [];
  for (let i = 0; i < tiles.length; i += 3) {
    const cells = [0, 1, 2]
      .map((j) => {
        const t = tiles[i + j];
        if (!t) return '<td width="33.33%"></td>';
        return `<td width="33.33%" valign="top" style="padding:14px 12px 14px 0"><div style="font:500 12px ${font};color:#6b7b80">${esc(t.label)}</div><div style="font:700 22px/1.2 ${numFont};color:#16232a;margin-top:3px">${esc(t.value)}</div>${t.note ? `<div style="font:400 12px/1.4 ${font};color:#6b7b80;margin-top:3px">${esc(t.note)}</div>` : ''}</td>`;
      })
      .join('');
    tileRows.push(`<tr>${cells}</tr>`);
  }
  const ok = m.status?.kind === 'ok';
  const status = m.status
    ? `<tr><td style="padding:22px 0 0"><div style="border-left:3px solid ${ok ? '#007a4d' : '#dc2430'};padding:2px 0 2px 14px"><div style="font:600 15px/1.5 ${font};color:#16232a">${esc(m.status.text)}</div>${(m.status.items ?? []).map((x) => `<div style="font:400 14px/1.6 ${font};color:#33444b">${esc(x)}</div>`).join('')}</div></td></tr>`
    : '';
  const sections = (m.sections ?? [])
    .map((s) => {
      const body = s.rows?.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${s.rows.map(([k, v]) => `<tr><td style="padding:5px 12px 5px 0;font:400 14px/1.5 ${font};color:#33444b">${esc(k)}</td><td align="right" valign="top" style="padding:5px 0;font:600 14px/1.5 ${numFont};color:#16232a">${esc(v)}</td></tr>`).join('')}</table>`
        : s.lines?.length
          ? s.lines.map((l) => `<div style="padding:5px 0;font:400 14px/1.5 ${font};color:#33444b">${esc(l)}</div>`).join('')
          : `<div style="padding:5px 0;font:400 14px/1.5 ${font};color:#8a989c">${esc(s.empty ?? 'None')}</div>`;
      return `<tr><td style="padding:18px 0;${line}"><div style="font:600 13px ${font};color:#16232a;margin-bottom:4px">${esc(s.title)}</div>${body}</td></tr>`;
    })
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"></head><body style="margin:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden">${esc(m.intro)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff"><tr><td align="center" style="padding:36px 20px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%">
<tr><td style="font:700 13px ${font};color:#007a4d;letter-spacing:0.06em">FLOKEFAMA <span style="font-weight:500;color:#8a989c;letter-spacing:0">&nbsp;·&nbsp; Site monitor</span></td></tr>
<tr><td style="padding:26px 0 0;font:400 13px ${font};color:#6b7b80">${esc(m.kicker)}</td></tr>
<tr><td style="padding:4px 0 0;font:700 24px/1.25 ${font};color:#16232a;letter-spacing:-0.01em">${esc(m.heading)}</td></tr>
<tr><td style="padding:8px 0 0;font:400 15px/1.6 ${font};color:#33444b">${esc(m.intro)}</td></tr>
${status}
${tileRows.length ? `<tr><td style="padding:22px 0 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${line}">${tileRows.join('')}</table></td></tr>` : '<tr><td height="22"></td></tr>'}
${sections}
<tr><td style="padding:24px 0 0;${line}"><a href="${siteUrl}/monitor" style="display:inline-block;background:#007a4d;color:#ffffff;font:600 14px ${font};text-decoration:none;padding:11px 20px;border-radius:8px">Open the site monitor</a></td></tr>
<tr><td style="padding:22px 0 0;font:400 12px/1.6 ${font};color:#8a989c">${esc(m.footer)}</td></tr>
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
