/**
 * When the opening (components/layout/site-intro.tsx) is on and when it plays. Kept apart from the component, which
 * runs in the browser, so the pages can read these on the server.
 */
export const introOn = (process.env.NEXT_PUBLIC_INTRO ?? '').trim().toLowerCase() !== 'off';

/**
 * Runs before the first paint and decides whether the opening plays:
 * - when someone opens the site (first visit, or back after 30 minutes or more away);
 * - on every third refresh in a row: refresh → no, refresh → no, refresh → plays (then the count starts again).
 * Opening pages in new tabs, following a link in from Google or WhatsApp, the back button and moving between pages
 * during a visit never play it, so a visitor browsing the shop isn't held up. "Away" is counted from the visitor's
 * last activity (SiteIntro keeps it current while they browse). Kept in localStorage (no cookies, nothing sent).
 * A click, tap or key before the page is ready (SiteIntro takes over then) ends the opening at once, as it does after.
 */
export const introScriptFor = (key: string) =>
  `try{(window.__ffIntroRan=window.__ffIntroRan||{})['${key}']=1;var s=localStorage,n=+(s.getItem('${key}-n')||0),t=+(s.getItem('${key}-t')||0),now=Date.now(),v=performance.getEntriesByType?performance.getEntriesByType('navigation')[0]:null,r=v?v.type==='reload':false,away=now-t>18e5;if(away)n=0;if((away||(r&&n>=2))&&!matchMedia('(prefers-reduced-motion: reduce)').matches){n=0;document.documentElement.classList.add('ff-intro');window.__ffIntro=performance.now();var q=function(e){if(window.__ffIntroLive||(e.type==='keydown'&&(e.repeat||/^(Control|Shift|Alt|Meta|F5)$/.test(e.key))))return;document.documentElement.classList.remove('ff-intro');removeEventListener('pointerdown',q);removeEventListener('keydown',q)};addEventListener('pointerdown',q);addEventListener('keydown',q)}else if(r){n++}s.setItem('${key}-n',String(n));s.setItem('${key}-t',String(now))}catch(e){}`;
/** The website's opening. The hospital and engineer dashboards have their own (app/portal, app/engineer), counted apart. */
export const introScript = introScriptFor('ff-intro');


/**
 * The same decision, for arriving without a page load: signing in, or a demo link, takes the visitor to their dashboard
 * that way, so the script above never runs. Such an arrival is like following a link in: the opening plays the first
 * time, and after 30 minutes or more away. Called by SiteIntro before the first paint (useLayoutEffect).
 */
export function decideIntro(key: string) {
  const w = window as Window & { __ffIntroRan?: Record<string, number>; __ffIntro?: number };
  if (w.__ffIntroRan?.[key]) return;
  (w.__ffIntroRan ??= {})[key] = 1;
  try {
    const s = localStorage;
    const now = Date.now();
    const away = now - Number(s.getItem(`${key}-t`) || 0) > 18e5;
    if (away) s.setItem(`${key}-n`, '0');
    if (away && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('ff-intro');
      w.__ffIntro = performance.now();
    }
    s.setItem(`${key}-t`, String(now));
  } catch {
    /* storage blocked: no opening */
  }
}
