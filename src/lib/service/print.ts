import QRCode from 'qrcode';
import { facilityCodeOf } from '@/lib/service/codes';
import { contact } from '@/data/seed';
import { fmtDate, jobKind, scheduleLabel, type Asset, type Ticket } from '@/lib/service/desk';

/**
 * Printed paperwork for the field: the one-page service report a hospital stamps and signs on the spot, and the
 * equipment tag stuck on each machine (with a QR code that opens the Support form for that machine). Both open in a
 * new window ready to print (or save as PDF from the print dialog).
 */

/** Text made safe for the printed HTML (names can come from anyone, through the Support page). */
const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** The logo drawn in the page itself (a print window can't load the site's images: they are protected from other pages). */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 286.32 52.66"><g><path fill="#00703A" fill-rule="evenodd" d="M26.33 0C40.87 0 52.66 11.79 52.66 26.33C52.66 40.87 40.87 52.66 26.33 52.66C11.79 52.66 0 40.87 0 26.33C0 11.79 11.79 0 26.33 0"/><path fill="#FFFFFF" fill-rule="evenodd" d="M30.3 5.99C36.25 11 39.97 17.36 39.95 25.06C39.7 34.3 36.8 38.82 31.76 41.77C30.68 41.46 29.79 39.48 31.31 35.83C32.65 32.61 36.31 30.14 37.26 25.51C38.36 20.16 35.61 13.09 30.3 5.99"/><path fill="#FFFFFF" fill-rule="evenodd" d="M23.24 10.14C17.5 14.89 13.22 20.17 12.47 25.51C11.17 34.67 13.85 39.35 20.88 42.89C23.5 43.96 25.89 44.18 28.51 44.13C29.74 42.86 29.71 41.66 29.07 41.1C21.39 37.92 16.29 36.4 15.95 26.52C15.81 22.59 17.99 15.98 23.24 10.14"/><path fill="#ED1C24" fill-rule="evenodd" d="M23.57 24.64C25.19 24.11 27.17 25.69 27.98 28.17C28.79 30.65 28.13 33.09 26.5 33.62C24.88 34.15 22.9 32.57 22.09 30.09C21.29 27.61 21.95 25.17 23.57 24.64"/></g><g transform="translate(62.56,10.690) scale(0.90641)"><path fill="#00703A" d="M17.05 21.87L8 21.87L8 33.36L0 33.36L0 11.03C0 8.15 0.87 5.78 2.6 3.93C4.33 2.08 6.63 1.15 9.51 1.15L17.05 1.15L17.05 8.87L10.8 8.87C9.76 8.87 9.03 9.06 8.62 9.44C8.2 9.83 8 10.48 8 11.4L8 14.43L17.05 14.43L17.05 21.87M38.05 33.36L31.94 33.36C27.99 33.36 25.09 32.55 23.25 30.93C21.41 29.3 20.5 26.65 20.5 22.98L20.5 1.15L28.49 1.15L28.49 22.24C28.49 23.56 28.77 24.46 29.34 24.93C29.91 25.4 30.99 25.64 32.58 25.64L38.05 25.64L38.05 33.36M72.84 17.28C72.84 21.81 71.24 25.72 68.06 29C64.87 32.27 61 33.91 56.43 33.91C51.87 33.91 48 32.28 44.83 29.02C41.66 25.76 40.07 21.84 40.07 17.28C40.07 12.71 41.67 8.79 44.85 5.51C48.04 2.24 51.9 0.6 56.43 0.6C61 0.6 64.87 2.24 68.06 5.51C71.24 8.79 72.84 12.71 72.84 17.28M64.75 17.28C64.75 14.95 63.95 12.95 62.34 11.28C60.73 9.61 58.76 8.78 56.43 8.78C54.13 8.78 52.18 9.61 50.57 11.28C48.96 12.95 48.16 14.95 48.16 17.28C48.16 19.61 48.96 21.6 50.55 23.25C52.14 24.91 54.1 25.73 56.43 25.73C58.79 25.73 60.77 24.91 62.36 23.25C63.95 21.6 64.75 19.61 64.75 17.28M101.88 1.15L97.28 10.62C96.89 11.44 96.44 12.19 95.95 12.87C95.46 13.54 94.89 14.08 94.25 14.48C96.27 15 97.76 15.88 98.71 17.12C99.66 18.36 100.13 19.79 100.13 21.41L100.13 33.36L91.72 33.36L91.72 23.16C91.72 21.6 91.33 20.63 90.55 20.27C89.77 19.9 88.02 19.71 85.29 19.71L85.29 33.36L77.29 33.36L77.29 1.15L85.29 1.15L85.29 12.27C86.09 12.27 86.68 12.17 87.08 11.97C87.48 11.77 87.82 11.38 88.09 10.8L92.69 1.15L101.88 1.15M123.34 33.36L118.79 33.36C114.53 33.36 111.02 31.81 108.24 28.7C105.47 25.59 104.09 21.78 104.09 17.28C104.09 12.71 105.46 8.88 108.22 5.79C110.98 2.7 114.5 1.15 118.79 1.15L123.34 1.15L123.34 8.59C119.66 8.59 117.22 8.89 116.01 9.49C114.8 10.09 113.67 11.52 112.63 13.79L123.34 13.79L123.34 20.77L112.63 20.77C113.67 23.07 114.8 24.5 116.01 25.07C117.22 25.63 119.66 25.92 123.34 25.92L123.34 33.36"/><path fill="#00703A" d="M153.06 22.07L143.67 22.07L143.67 33.99L135.37 33.99L135.37 10.82C135.37 7.83 136.27 5.38 138.07 3.46C139.86 1.53 142.25 0.57 145.24 0.57L153.06 0.57L153.06 8.58L146.58 8.58C145.5 8.58 144.74 8.78 144.31 9.18C143.88 9.57 143.67 10.25 143.67 11.2L143.67 14.35L153.06 14.35L153.06 22.07"/><path fill="#00703A" d="M180.47 33.99L172.13 33.99L172.13 22.36L166.93 22.36L166.93 14.82L172.13 14.82L172.13 11.68C172.13 10.41 171.82 9.4 171.2 8.65C170.58 7.9 169.76 7.53 168.74 7.53C167.69 7.53 166.87 7.9 166.26 8.63C165.66 9.36 165.36 10.38 165.36 11.68L165.36 33.99L157.06 33.99L157.06 12.06C157.06 8.44 158.14 5.52 160.28 3.31C162.43 1.1 165.25 0 168.74 0C172.24 0 175.06 1.11 177.23 3.34C179.39 5.56 180.47 8.47 180.47 12.06L180.47 33.99"/><path fill="#00703A" d="M219.7 33.99L211.78 33.99L210.31 6.77L206.06 30.23C205.84 31.5 205.35 32.52 204.59 33.32C203.82 34.11 202.93 34.51 201.92 34.51C200.87 34.51 199.98 34.13 199.25 33.37C198.52 32.6 198.02 31.56 197.77 30.23L193.67 7.53L192.15 33.99L184.23 33.99L186.9 7.25C187.16 4.64 187.72 2.78 188.59 1.67C189.47 0.56 191.08 0 193.43 0C196.8 0 198.79 2.03 199.39 6.1L201.82 22.21L202.06 22.21L204.49 6.1C205.1 2.03 207.1 0 210.5 0C212.88 0 214.5 0.54 215.36 1.62C216.22 2.7 216.77 4.58 217.03 7.25L219.7 33.99"/><path fill="#00703A" d="M246.87 33.99L238.53 33.99L238.53 22.36L233.33 22.36L233.33 14.82L238.53 14.82L238.53 11.68C238.53 10.41 238.22 9.4 237.6 8.65C236.98 7.9 236.16 7.53 235.14 7.53C234.09 7.53 233.27 7.9 232.66 8.63C232.06 9.36 231.76 10.38 231.76 11.68L231.76 33.99L223.46 33.99L223.46 12.06C223.46 8.44 224.54 5.52 226.68 3.31C228.83 1.1 231.65 0 235.14 0C238.64 0 241.46 1.11 243.63 3.34C245.79 5.56 246.87 8.47 246.87 12.06L246.87 33.99"/></g></svg>`;
const logo = (h: string) => LOGO_SVG.replace('<svg ', `<svg style="height:${h};width:auto;display:block" `);

function openPrint(title: string, body: string, css: string) {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><base href="${location.origin}/"><style>${css}</style></head><body>${body}
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`);
  w.document.close();
  return true;
}

const reportCss = `@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font:12.5px/1.45 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#16232a;margin:0}
header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #007a4d;padding-bottom:10px}
header img{height:38px}header .co{text-align:right;font-size:11px;color:#4b5b53}h1{font-size:20px;margin:16px 0 2px}.sub{color:#4b5b53;margin:0 0 14px}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #cfd9d3;padding:6px 8px;vertical-align:top;text-align:left}th{background:#eef4f0;font-weight:600;width:24%}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#007a4d;margin:16px 0 6px}.box{border:1px solid #cfd9d3;padding:8px 10px;min-height:54px;white-space:pre-wrap}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}.sign div{border:1px solid #cfd9d3;padding:8px 10px;height:118px;position:relative}
.sign b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#4b5b53}.sign span{position:absolute;bottom:8px;left:10px;right:10px;border-top:1px dotted #8a9a92;padding-top:3px;font-size:11px;color:#4b5b53}
.stamp{border-style:dashed!important}footer{margin-top:14px;font-size:10.5px;color:#6b7b73;text-align:center}
@media screen{body{max-width:800px;margin:24px auto;padding:0 16px}}`;

/** The one-page service report for a job, with boxes for the facility's stamp and signature. */
export function printServiceReport(t: Ticket, asset: Asset | undefined) {
  const parts = t.parts.length ? t.parts.map((p) => `${p.qty} × ${esc(p.name)}`).join('<br>') : 'None';
  const findings = t.log.filter((l) => l.kind === 'note').map((l) => `${esc(fmtDate(l.at))} · ${esc(l.by)}: ${esc(l.text)}`).join('\n');
  const body = `<header>${logo('38px')}<div class="co">Flokefama Company Limited<br>Santa Maria, Accra · ${esc(contact.phone)}<br>${esc(contact.support)}</div></header>
<h1>Service report</h1><p class="sub">${esc(jobKind(t))} · Job ${esc(t.id)}</p>
<table>
<tr><th>Facility</th><td>${esc(asset?.facility ?? '')}${facilityCodeOf(asset?.facility) ? ` (${esc(facilityCodeOf(asset?.facility)!)})` : ''}</td><th>Department</th><td>${esc(asset?.location ?? '')}</td></tr>
<tr><th>Equipment</th><td>${esc(`${asset?.brand ?? ''} ${asset?.name ?? t.title.split(':')[0]}`.trim())}</td><th>Serial number</th><td>${esc(asset?.serial ?? '')}</td></tr>
<tr><th>Reported</th><td>${esc(fmtDate(t.openedAt))}${t.requestedBy ? ` · ${esc(t.requestedBy)}` : ''}</td><th>Completed</th><td>${t.resolvedAt ? esc(fmtDate(t.resolvedAt)) : 'In progress'}</td></tr>
<tr><th>Engineer</th><td>${esc(t.engineer ?? '')}${t.engineerPhone ? ` · ${esc(t.engineerPhone)}` : ''}</td><th>Warranty</th><td>${asset ? (asset.suppliedByUs === false ? 'Not supplied by Flokefama' : new Date(asset.warrantyUntil).getTime() > Date.now() ? `Under warranty until ${esc(fmtDate(asset.warrantyUntil))}` : 'Out of warranty') : ''}</td></tr>
</table>
<h2>Problem reported</h2><div class="box">${esc(t.description)}</div>
${findings ? `<h2>Findings</h2><div class="box">${findings}</div>` : ''}
<h2>Work carried out</h2><div class="box">${esc(t.resolution ?? '')}</div>
<table style="margin-top:12px"><tr><th>Parts used</th><td>${parts}</td></tr>
<tr><th>Next service</th><td>${asset && asset.suppliedByUs !== false ? `${esc(fmtDate(asset.nextCalibration))} · ${esc(scheduleLabel(asset))}` : 'On request'}</td></tr></table>
<div class="sign"><div><b>Engineer</b><span>Name, signature and date</span></div><div><b>Facility representative</b><span>Name, signature and date</span></div></div>
<div class="sign"><div class="stamp" style="grid-column:1/-1;height:120px"><b>Facility stamp</b></div></div>
<footer>Thank you for choosing Flokefama · Saving Lives since 2008 · Call centre ${esc(contact.phone)}</footer>`;
  return openPrint(`Service report ${t.id}`, body, reportCss);
}

/** Where the tag's QR code leads: the Support form, filled in for this machine. */
export const tagUrl = (a: Asset) => `${location.origin}/support?asset=${encodeURIComponent(a.id)}#request`;

const tagCss = `@page{size:90mm 60mm;margin:0}*{box-sizing:border-box}body{margin:0;font:9.5px/1.3 system-ui,Arial,sans-serif;color:#16232a}
.tag{width:90mm;height:60mm;padding:3.5mm 4mm;display:flex;flex-direction:column;border:.3mm solid #007a4d}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:.6mm solid #007a4d;padding-bottom:1.5mm}.top img{height:7mm}
.call{background:#dc2430;color:#fff;font-weight:700;padding:1mm 2mm;text-align:center;font-size:8px;line-height:1.2}.call b{display:block;font-size:10px}
.mid{display:flex;gap:3mm;margin-top:2mm;flex:1}table{border-collapse:collapse;flex:1}td{padding:.5mm 0;vertical-align:top}td:first-child{color:#4b5b53;width:22mm;white-space:nowrap}
td:last-child{font-weight:600;border-bottom:.2mm dotted #9aa9a1}.qr{width:24mm;text-align:center;font-size:7px;color:#4b5b53}.qr img{width:24mm;height:24mm;display:block}
@media screen{body{padding:24px;background:#eef2f0}.tag{background:#fff;transform:scale(1.6);transform-origin:top left}}`;

/** The equipment tag: facility, equipment, model, serial, service dates and the call centre, with a QR code. */
export async function printTag(a: Asset) {
  const qr = await QRCode.toDataURL(tagUrl(a), { margin: 0, width: 300, errorCorrectionLevel: 'M', color: { dark: '#16232a', light: '#ffffff' } });
  const body = `<div class="tag"><div class="top">${logo('7mm')}<div class="call">CALL CENTRE<b>${esc(contact.phone)}</b></div></div>
<div class="mid"><table>
<tr><td>Facility</td><td>${esc(a.facility)}</td></tr>
<tr><td>Equipment</td><td>${esc(a.name)}</td></tr>
<tr><td>Model / brand</td><td>${esc(a.brand || '—')}</td></tr>
<tr><td>Serial number</td><td>${esc(a.serial)}</td></tr>
<tr><td>Installed</td><td>${esc(fmtDate(a.installed))}</td></tr>
<tr><td>Services</td><td>${a.suppliedByUs === false ? 'Repairs' : a.ivd ? 'Preventive maintenance (IVD)' : 'Preventive maintenance'}</td></tr>
<tr><td>Last service</td><td>${esc(fmtDate(a.lastCalibration))}</td></tr>
<tr><td>Next service</td><td>${a.suppliedByUs === false ? 'On request' : esc(fmtDate(a.nextCalibration))}</td></tr>
</table><div class="qr"><img src="${qr}" alt="QR code">Scan to report a fault</div></div></div>`;
  return openPrint(`Tag ${a.name}`, body, tagCss);
}
