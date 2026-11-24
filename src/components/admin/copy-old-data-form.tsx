'use client';

import { useActionState } from 'react';
import { copyFromAppwrite } from '@/lib/admin/actions';
import type { CopyReport } from '@/lib/admin/copy-old-data';

/** Database & settings: one button that copies the old data from Appwrite into Supabase, and what it copied. */
export function CopyOldDataForm() {
  const [report, action, pending] = useActionState<CopyReport | null, FormData>(copyFromAppwrite, null);
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="h-11 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
        {pending ? 'Copying… (this can take a minute)' : 'Copy the old data from Appwrite'}
      </button>
      {report && (
        <div className={`mt-4 rounded-xl px-4 py-3 text-[0.9375rem] ${report.ok ? 'bg-brand-50' : 'bg-[#fdecec]'}`}>
          <p className="font-medium">{report.message}</p>
          {report.ok && (
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[0.875rem] text-ink-3 sm:grid-cols-3">
              {report.tables.map((t) => <li key={t.table}><span className="font-mono">{t.table}</span>: {t.rows}{t.skipped ? ` (${t.skipped} left)` : ''}</li>)}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
