'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { decideIntro } from '@/lib/intro';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';

/**
 * The opening of the site: the Flokefama logo in the middle of a green gradient; after a moment it rises into its
 * place in the header and the green fades away, showing the page.
 *
 * - When the site is opened, on every third refresh, and after 30 minutes away (introScript); on the public site only
 *   (app/(site)/layout.tsx), never in the portals or admin.
 * - Skipped for visitors whose device asks for reduced motion; any click, tap, scroll or key ends it at once (the
 *   overlay takes that first tap, so it never lands on a link underneath).
 * - The decision is made before the page is painted (introScript, in the layout), so nothing flashes; if JavaScript
 *   fails, the overlay clears itself after 4 seconds (globals.css, ff-intro-failsafe).
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

const HOLD = 1100; // the logo rests in the middle (counted from when the overlay first appeared)
const RISE = 850; // the logo rises into the header

/**
 * `storageKey`: the area's counts (website, hospital dashboard, engineer dashboard). `target`: where the big logo lands
 * (the first visible match). `logo`: the big logo, a larger copy of the target (default: the website's).
 */
export function SiteIntro({ storageKey = 'ff-intro', target: targetSelector = 'header [data-intro-target]', logo: bigLogo }: { storageKey?: string; target?: string; logo?: React.ReactNode } = {}) {
  const overlay = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const root = document.documentElement;
    const el = overlay.current;
    const group = logo.current;
    if (!root.classList.contains('ff-intro') || !el || !group) return;
    // The logo it lands on: the first visible one, looked up when the rise starts (a portal may draw its sidebar a moment
    // after loading; the portals' sidebar is hidden on phones, where the logo just fades)
    const findTarget = () => [...document.querySelectorAll<HTMLElement>(targetSelector)].find((e) => e.getBoundingClientRect().width > 0) ?? null;
    let target = findTarget();
    const animations: Animation[] = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      animations.forEach((a) => a.cancel());
      if (target) target.style.visibility = '';
      root.classList.remove('ff-intro');
      for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) window.removeEventListener(ev, skip);
    };
    // A click, tap, scroll or key: fade out quickly
    const skip = () => {
      if (done) return;
      animations.forEach((a) => a.pause());
      el.animate([{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).onfinish = finish;
    };
    for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) window.addEventListener(ev, skip, { passive: true });
    // The header logo stays hidden until the big one lands on it
    if (target) target.style.visibility = 'hidden';

    // The page may take a moment to become interactive: count the rest from when the overlay first appeared
    const shown = (window as Window & { __ffIntro?: number }).__ffIntro ?? performance.now();
    const timer = window.setTimeout(() => {
      if (done) return;
      target ??= findTarget();
      if (target) target.style.visibility = 'hidden';
      const from = group.getBoundingClientRect();
      const to = target?.getBoundingClientRect();
      const bg = el.querySelector<HTMLElement>('[data-intro-bg]');
      if (to && to.width > 0) {
        // The big logo is the header logo scaled up: move its top-left corner onto the header logo's and scale down
        const k = to.width / from.width;
        const move = group.animate(
          [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${k})` }],
          { duration: RISE, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
        );
        animations.push(move);
        move.onfinish = finish;
      } else {
        const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
        animations.push(fade);
        fade.onfinish = finish;
      }
      if (bg) animations.push(bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RISE * 0.8, delay: RISE * 0.2, easing: 'ease-in-out', fill: 'forwards' }));
    }, Math.max(150, HOLD - (performance.now() - shown)));

    return () => {
      window.clearTimeout(timer);
      finish();
    };
  }, [targetSelector]);

  return (
    <div ref={overlay} aria-hidden className="site-intro fixed inset-0 z-[200] items-center justify-center">
      <div data-intro-bg className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#0f7a4a_0%,#0a5a36_45%,#063d25_100%)]" />
      {!bigLogo && (
        /* The header logo (mark 32px, gap 6px, lettering 19px tall) drawn larger: 1.8× on phones, 3× on tablets, 3.75× on
           computers. The move scales it down onto the header logo exactly */
        <div ref={logo} className="site-intro-logo relative flex origin-top-left items-center gap-[11px] sm:gap-[18px] lg:gap-[22.5px]">
          <LogoMark className="size-[57.6px] sm:size-24 lg:size-[120px]" />
          <LogoWordmark className="h-[34.2px] text-white sm:h-[57px] lg:h-[71.25px]" />
        </div>
      )}
      {bigLogo && (
        <div ref={logo} className="site-intro-logo relative flex origin-top-left">
          {bigLogo}
        </div>
      )}
    </div>
  );
}
