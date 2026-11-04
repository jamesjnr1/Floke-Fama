'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';
import { decideIntro } from '@/lib/intro';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';

/**
 * The opening of the site: the Flokefama logo in the middle of a green gradient; after a moment it rises into its
 * place in the header and the green fades away, showing the page.
 *
 * - When the site is opened, on every third refresh, and after 30 minutes away (introScript); on the public site only
 *   (app/(site)/layout.tsx), never in the portals or admin.
 * - Skipped for visitors whose device asks for reduced motion; a click, tap or key ends it at once (the overlay takes
 *   that first tap, so it never lands on a link underneath). Scrolling doesn’t.
 * - The decision is made before the page is painted (introScript, in the layout), so nothing flashes; the animation is
 *   plain JavaScript in the page (introPlayer, lib/intro.ts), so it plays on time on a slow phone and React can't cut it
 *   short. If JavaScript fails, the overlay clears itself after 4 seconds (globals.css, ff-intro-failsafe).
 * - NEXT_PUBLIC_INTRO=off switches it off.
 */
/** The visitor's last activity in this area, for "back after 30 minutes away". */
const touchFor = (key: string) => () => {
  try {
    localStorage.setItem(`${key}-t`, String(Date.now()));
  } catch {
    /* storage blocked: the opening simply plays less */
  }
};

/**
 * `storageKey`: the area's counts (website, hospital dashboard, engineer dashboard). `target`: where the big logo lands
 * (the first visible match). `logo`: the big logo, a larger copy of the target (default: the website's).
 */
export function SiteIntro({ storageKey = 'ff-intro', target: targetSelector = 'header [data-intro-target]', logo: bigLogo }: { storageKey?: string; target?: string; logo?: React.ReactNode } = {}) {
  const pathname = usePathname();

  // Arriving without a page load (after signing in, from a demo link): decide here, before the first paint. After a
  // page load the script in the page has decided already, and this does nothing
  useLayoutEffect(() => decideIntro(storageKey), [storageKey]);
  // Browsing (moving between pages, coming back to the tab) counts as activity, so "away" means away. Not leaving the
  // page: a refresh after an hour with the tab idle should count as coming back
  useEffect(() => touchFor(storageKey)(), [pathname, storageKey]);
  useEffect(() => {
    const touch = touchFor(storageKey);
    const seen = () => document.visibilityState === 'visible' && touch();
    document.addEventListener('visibilitychange', seen);
    return () => document.removeEventListener('visibilitychange', seen);
  }, [storageKey]);

  // The animation itself is plain JavaScript (introPlayer, lib/intro.ts). The website starts it from the page, right
  // after its header; the portals (whose sidebar is drawn by the app) and arrivals without a page load start it here.
  // Starting twice does nothing
  useEffect(() => {
    (window as Window & { __ffIntroPlay?: (target: string) => void }).__ffIntroPlay?.(targetSelector);
  }, [targetSelector]);

  return (
    <div aria-hidden className="site-intro fixed inset-0 z-[200] items-center justify-center">
      <div data-intro-bg className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#0f7a4a_0%,#0a5a36_45%,#063d25_100%)]" />
      {!bigLogo && (
        /* The header logo (mark 32px, gap 6px, lettering 19px tall) drawn larger: 1.8× on phones, 3× on tablets, 3.75× on
           computers. The move scales it down onto the header logo exactly */
        <div className="site-intro-logo relative flex origin-top-left items-center gap-[11px] sm:gap-[18px] lg:gap-[22.5px]">
          <LogoMark className="size-[57.6px] sm:size-24 lg:size-[120px]" />
          <LogoWordmark className="h-[34.2px] text-white sm:h-[57px] lg:h-[71.25px]" />
        </div>
      )}
      {bigLogo && (
        <div className="site-intro-logo relative flex origin-top-left">
          {bigLogo}
        </div>
      )}
    </div>
  );
}
