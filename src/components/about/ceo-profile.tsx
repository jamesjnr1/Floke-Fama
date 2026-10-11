'use client';

import { useState } from 'react';
import type { SiteContent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type Ceo = SiteContent['ceo'];

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'education', label: 'Education' },
  { id: 'honours', label: 'Honours' },
  { id: 'purpose', label: 'Philanthropy & Purpose' },
] as const;

/** The CEO's own profile, one part at a time: a short tab row keeps the section compact without dropping any of it. */
export function CeoProfile({ ceo }: { ceo: Ceo }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('profile');
  const list = (items: Ceo['education']) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((x) => (
        <li key={x.title} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-6">
          <p className="font-semibold text-ink">{x.title}</p>
          <p className="text-ink-3">{x.detail}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto border-b border-line" role="tablist" aria-label="About our CEO">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`ceo-tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="ceo-panel"
            onClick={() => setTab(t.id)}
            className={cn('-mb-px shrink-0 border-b-2 py-3 text-[0.9375rem] transition-colors', tab === t.id ? 'border-brand-600 font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="ceo-panel" role="tabpanel" aria-labelledby={`ceo-tab-${tab}`} className="no-justify pt-6 text-[1.0625rem] leading-relaxed text-ink-3">
        {tab === 'profile' && <div className="space-y-4">{ceo.bio.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}</div>}
        {tab === 'education' && list(ceo.education)}
        {tab === 'honours' && list(ceo.honours)}
        {tab === 'purpose' && (
          <div>
            <p className="border-l-2 border-signal pl-4 text-lg font-semibold leading-snug text-ink">“{ceo.creed}”</p>
            <p className="mt-4">{ceo.purpose}</p>
          </div>
        )}
      </div>
    </div>
  );
}
