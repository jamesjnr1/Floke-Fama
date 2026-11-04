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

/**
 * Plays the opening, as plain JavaScript in the page: the Flokefama logo rests in the middle of the green for HOLD
 * (counted from when the green first appeared), then rises onto `target` (the first visible match: the header logo)
 * while the green fades away. A click, tap or key ends it at once with a short fade.
 *
 * Plain JavaScript, not React, on purpose (Nov 2026): run from the page itself as soon as the header is in it, it
 * plays on time on a slow phone (React only takes over once all the site's code has loaded, seconds later on a slow
 * connection), and nothing React does (drawing the page again after a mismatch) can cut it short. The whole rise is
 * scheduled at once, as browser animations with a delay (not a timer), so it starts on time even while the phone is
 * busy loading the rest of the site. Defined on every
 * page (app/layout.tsx); started by the website's layout right after its header, and by SiteIntro in the portals.
 * Plays once per page load; does nothing when the opening isn't due (no .ff-intro on <html>).
 */
const HOLD = 1000; // the logo rests in the middle
const MIN_REST = 250; // at least this long after the page can start it
const RISE = 700; // the logo rises into the header
export const introPlayer = `window.__ffIntroPlay=function(sel){try{var w=window,root=document.documentElement;if(w.__ffIntroStarted||!root.classList.contains('ff-intro'))return;var el=document.querySelector('.site-intro'),g=el&&el.querySelector('.site-intro-logo');if(!el||!g||!g.animate)return;w.__ffIntroStarted=1;w.__ffIntroLive=1;var done=0,anims=[];var finish=function(){if(done)return;done=1;anims.forEach(function(a){a.cancel()});root.classList.remove('ff-intro');removeEventListener('pointerdown',skip);removeEventListener('keydown',skip)};var skip=function(e){if(done||(e.type==='keydown'&&(e.repeat||/^(Control|Shift|Alt|Meta|F5)$/.test(e.key))))return;anims.forEach(function(a){a.pause()});el.animate([{opacity:getComputedStyle(el).opacity},{opacity:0}],{duration:180,fill:'forwards'}).onfinish=finish};addEventListener('pointerdown',skip,{passive:true});addEventListener('keydown',skip,{passive:true});var wait=Math.max(${MIN_REST},${HOLD}-(performance.now()-(w.__ffIntro||performance.now()))),t=null,list=document.querySelectorAll(sel);for(var i=0;i<list.length;i++){if(list[i].getBoundingClientRect().width>0){t=list[i];break}}var from=g.getBoundingClientRect(),to=t&&t.getBoundingClientRect(),bg=el.querySelector('[data-intro-bg]'),a;if(to&&to.width>0&&from.width>0){a=g.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate('+(to.left-from.left)+'px,'+(to.top-from.top)+'px) scale('+(to.width/from.width)+')'}],{duration:${RISE},delay:wait,easing:'cubic-bezier(0.65,0,0.35,1)',fill:'both'})}else{a=g.animate([{opacity:1},{opacity:0}],{duration:400,delay:wait,fill:'both'})}anims.push(a);a.onfinish=finish;if(bg)anims.push(bg.animate([{opacity:1},{opacity:0}],{duration:${Math.round(RISE * 0.8)},delay:wait+${Math.round(RISE * 0.2)},easing:'ease-in-out',fill:'both'}))}catch(e){document.documentElement.classList.remove('ff-intro')}};`;

/** Starts the opening from the page itself, right after the element it lands on (see introPlayer). */
export const introPlayScript = (target: string) => `window.__ffIntroPlay&&window.__ffIntroPlay(${JSON.stringify(target)})`;
