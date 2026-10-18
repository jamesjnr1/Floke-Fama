'use client';

import { useState } from 'react';
import type { SiteContent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type Ceo = SiteContent['ceo'];

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'education', label: 'Education' },
  { id: 'honours', label: 'Honours' },
] as const;

/** Profile, Education and Honours behind three square buttons, so the section stays short. */
export function CeoFeatureTabs({ ceo }: { ceo: Ceo }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('profile');
  const list = (items: Ceo['education']) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((x) => (
        <li key={x.title} className="py-5">
          <p className="text-lg font-semibold text-ink">{x.title}</p>
          <p className="mt-1 text-base leading-relaxed text-ink-3">{x.detail}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:flex" role="tablist" aria-label="About our CEO">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`ceo-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="ceo-panel"
            onClick={() => setTab(t.id)}
            className={cn(
              'h-12 px-2 text-[0.9375rem] font-semibold transition-colors sm:px-6 sm:text-base',
              tab === t.id ? 'bg-brand-600 text-white' : 'bg-paper text-ink ring-1 ring-inset ring-line hover:bg-mist',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id="ceo-panel" role="tabpanel" aria-labelledby={`ceo-tab-${tab}`} className="mt-8">
        {tab === 'profile' && (
          <div className="no-justify space-y-6 text-[1.1875rem] leading-[1.75] text-ink-2">
            {ceo.bio.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}
          </div>
        )}
        {tab === 'education' && list(ceo.education)}
        {tab === 'honours' && list(ceo.honours)}
      </div>
    </div>
  );
}
