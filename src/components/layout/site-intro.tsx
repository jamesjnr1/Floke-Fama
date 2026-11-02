'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { cn } from '@/lib/utils';

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
export const introOn = (process.env.NEXT_PUBLIC_INTRO ?? '').trim().toLowerCase() !== 'off';

/**
 * Runs before the first paint and decides whether the opening plays:
 * - when someone opens the site (first visit, or back after 30 minutes or more away);
 * - on every third refresh in a row: refresh → no, refresh → no, refresh → plays (then the count starts again).
 * Opening pages in new tabs, following a link in from Google or WhatsApp, the back button and moving between pages
 * during a visit never play it, so a visitor browsing the shop isn't held up. "Away" is counted from the visitor's
 * last activity (SiteIntro keeps it current while they browse). Kept in localStorage (no cookies, nothing sent).
 */
export const introScript = `try{var s=localStorage,n=+(s.getItem('ff-intro-n')||0),t=+(s.getItem('ff-intro-t')||0),now=Date.now(),v=performance.getEntriesByType?performance.getEntriesByType('navigation')[0]:null,r=v?v.type==='reload':false,away=now-t>18e5;if(away)n=0;if((away||(r&&n>=2))&&!matchMedia('(prefers-reduced-motion: reduce)').matches){n=0;document.documentElement.classList.add('ff-intro');window.__ffIntro=performance.now()}else if(r){n++}s.setItem('ff-intro-n',String(n));s.setItem('ff-intro-t',String(now))}catch(e){}`;

/** The visitor's last activity on the site, for "back after 30 minutes away". */
const touch = () => {
  try {
    localStorage.setItem('ff-intro-t', String(Date.now()));
  } catch {
    /* storage blocked: the opening simply plays less */
  }
};

const HOLD = 1100; // the logo rests in the middle (counted from when the overlay first appeared)
const RISE = 850; // the logo rises into the header

export function SiteIntro({ mottoClassName }: { mottoClassName?: string }) {
  const overlay = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const motto = useRef<HTMLParagraphElement>(null);
  const pathname = usePathname();

  // Browsing (moving between pages, coming back to the tab) counts as activity, so "away" means away. Not leaving the
  // page: a refresh after an hour with the tab idle should count as coming back
  useEffect(touch, [pathname]);
  useEffect(() => {
    const seen = () => document.visibilityState === 'visible' && touch();
    document.addEventListener('visibilitychange', seen);
    return () => document.removeEventListener('visibilitychange', seen);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const el = overlay.current;
    const group = logo.current;
    if (!root.classList.contains('ff-intro') || !el || !group) return;
    const target = document.querySelector<HTMLElement>('header a[aria-label="Flokefama home"]');
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
      const from = group.getBoundingClientRect();
      const to = target?.getBoundingClientRect();
      const bg = el.querySelector<HTMLElement>('[data-intro-bg]');
      // The motto isn't in the header: it fades as the logo starts to rise
      if (motto.current) animations.push(motto.current.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' }));
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
  }, []);

  return (
    <div ref={overlay} aria-hidden className="site-intro fixed inset-0 z-[200] items-center justify-center">
      <div data-intro-bg className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#0f7a4a_0%,#0a5a36_45%,#063d25_100%)]" />
      {/* The header logo (mark 32px, gap 6px, lettering 19px tall) drawn larger: 1.8× on phones, 3× on tablets, 3.75× on
          computers. The move scales it down onto the header logo exactly */}
      <div ref={logo} className="site-intro-logo relative flex origin-top-left items-center gap-[11px] sm:gap-[18px] lg:gap-[22.5px]">
        <LogoMark className="size-[57.6px] sm:size-24 lg:size-[120px]" />
        <span className="relative flex">
          <LogoWordmark className="h-[34.2px] text-white sm:h-[57px] lg:h-[71.25px]" />
          {/* The motto, in Poppins, right under the FLOKE FAMA lettering (placed outside the logo's box, so the move
              still lands the logo exactly) */}
          <p
            ref={motto}
            className={cn('site-intro-motto absolute inset-x-0 top-full mt-1.5 whitespace-nowrap text-center text-[0.8125rem] tracking-[0.08em] text-white/85 sm:mt-2.5 sm:text-base lg:mt-3 lg:text-lg', mottoClassName)}
          >
            Saving Lives since 2008
          </p>
        </span>
      </div>
    </div>
  );
}
