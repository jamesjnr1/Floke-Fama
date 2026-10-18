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

/**
 * Profile, Education, Honours and Philanthropy & Purpose behind four square buttons, so the section stays short. The
 * buttons sit beside the portrait; the text runs the full width of the section below it.
 */
export function CeoFeatureTabs({ ceo }: { ceo: Ceo }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('profile');
  const list = (items: Ceo['education']) => (
    <ul className="grid border-t border-line md:grid-cols-2 md:gap-x-16">
      {items.map((x) => (
        <li key={x.title} className="border-b border-line py-5">
          <p className="text-lg font-semibold text-ink">{x.title}</p>
          <p className="mt-1 text-base leading-relaxed text-ink-3">{x.detail}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-[58%]" role="tablist" aria-label="About our CEO">
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

      {/* Starts below the portrait, which reaches 10rem under the band */}
      <div id="ceo-panel" role="tabpanel" aria-labelledby={`ceo-tab-${tab}`} className="mt-8 lg:mt-16">
        {tab === 'profile' && (
          <div className="no-justify space-y-6 text-[1.1875rem] leading-[1.75] text-ink-2">
            {ceo.bio.map((t) => <p key={t.slice(0, 40)}>{t}</p>)}
          </div>
        )}
        {tab === 'education' && list(ceo.education)}
        {tab === 'honours' && list(ceo.honours)}
        {tab === 'purpose' && (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
            <p className="text-[clamp(1.5rem,1.2rem+1vw,2.125rem)] font-bold leading-snug tracking-[-0.02em] text-ink">“{ceo.creed}”</p>
            <p className="no-justify text-[1.1875rem] leading-[1.75] text-ink-2">{ceo.purpose}</p>
          </div>
        )}
      </div>
    </div>
  );
}
