'use client';

import { Card } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { downloadCertificate } from '@/lib/service/certificate';
import { fmtDate, type Asset } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Every calibration and validation certificate for the facility, newest first, downloadable. */
export function CertificatesView({ assets, onOpenAsset }: { assets: Asset[]; onOpenAsset: (id: string) => void }) {
  const rows = assets.flatMap((a) => a.certificates.map((c) => ({ a, c }))).sort((x, y) => y.c.date.localeCompare(x.c.date));
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Calibration certificates</caption>
          <thead>
            <tr className="border-b border-line bg-canvas text-left">
              {['Certificate', 'System', 'Date', 'Result', 'Engineer', ''].map((h) => (
                <th key={h} scope="col" className="px-5 py-3 text-xs font-medium text-ink-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ a, c }) => (
              <tr key={`${a.id}-${c.id}`} className="hover:bg-canvas/60">
                <td className="px-5 py-3.5 font-mono text-xs text-ink">{c.id}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => onOpenAsset(a.id)} className="text-left font-medium text-ink hover:text-brand-700">{a.name}</button>
                  <span className="block text-xs text-ink-3">{a.serial}</span>
                </td>
                <td className="px-5 py-3.5 text-ink-2">{fmtDate(c.date)}</td>
                <td className="px-5 py-3.5">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', c.result === 'Pass' ? 'bg-brand-50 text-brand-700' : 'bg-mist text-ink-2')}>{c.result}</span>
                </td>
                <td className="px-5 py-3.5 text-ink-2">{c.engineer}</td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => downloadCertificate(a, c)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50" aria-label={`Download certificate ${c.id}`}>
                    <Icon name="fi-rr-download" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
