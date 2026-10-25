'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type Ceo = SiteContent['ceo'];

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'education', label: 'Education' },
  { id: 'honours', label: 'Honours' },
  { id: 'purpose', label: 'Philanthropy & Purpose' },
] as const;

/** Puts the company's name in bold where it appears in the CEO's text. */
function withBoldName(text: string) {
  const name = 'FLOKEFAMA Company Limited';
  const at = text.indexOf(name);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-bold text-ink">{name}</strong>
      {text.slice(at + name.length)}
    </>
  );
}

/**
 * "Meet our CEO", the 'message' style (default, see ceoStyle), laid out like a leadership page: a short photo banner
 * with "Leadership" in the middle; then, on a light background, "Message from our CEO" in bold, his name and title,
 * and Profile, Education, Honours and Philanthropy & Purpose behind four buttons. The profile is his text in plain
 * paragraphs and his creed as a large quote under quote marks. The portrait stands on the right, beside the text.
 */
export function CeoMessage({ ceo }: { ceo: Ceo }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('profile');
  const list = (items: Ceo['education']) => (
    <ul className="space-y-5">
      {items.map((x) => (
        <li key={x.title}>
          <p className="text-lg font-semibold text-ink">{x.title}</p>
          <p className="mt-1 leading-relaxed text-ink-2">{x.detail}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28">
      <div className="relative isolate grid h-[160px] place-items-center overflow-hidden md:h-[220px]">
        <Image src="/images/office-team.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[center_35%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/70" />
        <h2 id="ceo-title" className="text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] font-bold tracking-[-0.02em] !text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.35)]">
          Leadership
        </h2>
      </div>

      <div className="bg-canvas py-12 md:py-16">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 md:px-10 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <Reveal>
            <p className="text-[1.25rem] font-bold text-ink">Message from our CEO</p>
            <p className="mt-4 text-[clamp(1.75rem,1.4rem+1vw,2.375rem)] font-bold leading-tight tracking-[-0.02em] text-ink">{ceo.name}</p>
            <p className="mt-2 text-ink-2">{ceo.role}</p>

            <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label="About our CEO">
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
                <>
                  <div className="no-justify space-y-8 text-[1.125rem] leading-[1.8] text-ink">
                    {ceo.bio.map((t) => (
                      <p key={t.slice(0, 40)}>{withBoldName(t)}</p>
                    ))}
                  </div>
                  <figure className="mt-10">
                    {/* Quote marks, drawn in outline */}
                    <svg aria-hidden viewBox="0 0 56 46" className="h-12 w-14 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M14 2c-7 0-12 5-12 11.5S7 25 13 25c1.6 0 3-.3 4.2-.9C16.2 32 11.4 39 4 43l1.4 1.6C17.6 39 26 28 26 15 26 7.5 21 2 14 2Z" />
                      <path d="M42 2c-7 0-12 5-12 11.5S35 25 41 25c1.6 0 3-.3 4.2-.9C44.2 32 39.4 39 32 43l1.4 1.6C45.6 39 54 28 54 15 54 7.5 49 2 42 2Z" />
                    </svg>
                    <blockquote className="mt-5 text-[clamp(1.75rem,1.3rem+1.4vw,2.625rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink">{ceo.creed}</blockquote>
                  </figure>
                </>
              )}
              {tab === 'education' && list(ceo.education)}
              {tab === 'honours' && list(ceo.honours)}
              {tab === 'purpose' && <p className="no-justify text-[1.125rem] leading-[1.8] text-ink">{ceo.purpose}</p>}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="lg:self-stretch">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e6e3] shadow-[0_10px_30px_-18px_rgb(11_21_16/0.35)] lg:aspect-auto lg:h-full lg:min-h-[640px]">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
