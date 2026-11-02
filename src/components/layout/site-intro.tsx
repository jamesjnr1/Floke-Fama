'use client';

import { useEffect, useRef } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';

/**
 * The opening of the site: the Flokefama logo in the middle of a green gradient; after a moment it rises into its
 * place in the header and the green fades away, showing the page.
 *
 * - Once per visit (sessionStorage), on the public site only (app/(site)/layout.tsx), never in the portals or admin.
 * - Skipped for visitors whose device asks for reduced motion; any click, tap, scroll or key ends it at once (the
 *   overlay takes that first tap, so it never lands on a link underneath).
 * - The decision is made before the page is painted (introScript, in the layout), so nothing flashes; if JavaScript
 *   fails, the overlay clears itself after 4 seconds (globals.css, ff-intro-failsafe).
 * - NEXT_PUBLIC_INTRO=off switches it off.
 */
export const introOn = (process.env.NEXT_PUBLIC_INTRO ?? '').trim().toLowerCase() !== 'off';

/** Runs before the first paint: marks <html> when the opening should play (and remembers it has played). */
export const introScript = `try{if(!sessionStorage.getItem('ff-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('ff-intro');window.__ffIntro=performance.now();sessionStorage.setItem('ff-intro','1')}}catch(e){}`;

const HOLD = 1100; // the logo rests in the middle (counted from when the overlay first appeared)
const RISE = 850; // the logo rises into the header

export function SiteIntro() {
  const overlay = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);

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
      {/* The header logo (mark 32px, gap 6px, lettering 19px tall) drawn larger, 1.5× on phones and 2.5× from tablets:
          the move scales it down exactly */}
      <div ref={logo} className="site-intro-logo relative flex origin-top-left items-center gap-[9px] sm:gap-[15px]">
        <LogoMark className="size-12 sm:size-20" />
        <LogoWordmark className="h-[28.5px] text-white sm:h-[47.5px]" />
      </div>
    </div>
  );
}
