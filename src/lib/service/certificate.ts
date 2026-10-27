import { contact } from '@/data/seed';
import { fmtDate, type Asset, type Certificate } from '@/lib/service/store';

/** Text made safe to put in the certificate's HTML (names can come from anyone, through the Support page). */
const esc = (v: unknown) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Builds a printable calibration certificate and downloads it as an HTML file. */
export function downloadCertificate(asset: Asset, c: Certificate) {
  const html = `<!doctype html><meta charset="utf-8"><title>${esc(c.id)}</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:640px;margin:48px auto;color:#16232a}h1{color:#007a4d;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:8px;border-bottom:1px solid #dde5e0}td:first-child{color:#5b6b62;width:40%}.note{margin-top:32px;font-size:12px;color:#5b6b62}</style>
<h1>Calibration certificate</h1><p>Flokefama Company Limited · ${esc(contact.phone)}</p>
<table>
<tr><td>Certificate</td><td>${esc(c.id)}</td></tr><tr><td>Date</td><td>${esc(fmtDate(c.date))}</td></tr>
<tr><td>System</td><td>${esc(`${asset.brand} ${asset.name}`.trim())}</td></tr><tr><td>Serial</td><td>${esc(asset.serial)}</td></tr>
<tr><td>Facility</td><td>${esc(asset.facility)}, ${esc(asset.location)}</td></tr><tr><td>Result</td><td>${esc(c.result)}</td></tr>
<tr><td>Engineer</td><td>${esc(c.engineer)}</td></tr>${c.notes ? `<tr><td>Notes</td><td>${esc(c.notes)}</td></tr>` : ''}
<tr><td>Next calibration due</td><td>${esc(fmtDate(asset.nextCalibration))}</td></tr>
</table><p class="note">Issued through the Flokefama service portal.</p>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${c.id}-${asset.serial}.html`.replace(/[^\w.-]/g, '_') });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

