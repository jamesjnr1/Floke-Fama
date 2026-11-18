/** True when the visitor's device asks for less motion. */
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Also, before anything else: the page survives tools that rewrite its text. Chrome's "Translate this page" (and
 * translation or grammar extensions) wrap the page's words in their own tags; React then asks to remove or insert next
 * to a word that has moved, the browser throws "Failed to execute 'insertBefore' / 'removeChild' on 'Node'" and the
 * visitor got the error page (Nov 2026, /about). Those two calls now do nothing when the node is no longer where React
 * expects it, instead of throwing (the usual fix, facebook/react#11538). Everything else is unchanged.
 */
const domGuard = `(function(){if(typeof Node!=='function'||!Node.prototype)return;var r=Node.prototype.removeChild,i=Node.prototype.insertBefore;Node.prototype.removeChild=function(c){if(c&&c.parentNode!==this)return c;return r.apply(this,arguments)};Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this)return n;return i.apply(this,arguments)}})();`;

/** Runs in <head> before first paint: lets the fade-ins (Reveal) start hidden only where they can be shown again. */
export const bootScript = `${domGuard}if('IntersectionObserver' in window)document.documentElement.setAttribute('data-reveal-ready','');`;

/**
 * Runs as soon as the page's HTML has arrived, before the JavaScript bundles: shows everything already on screen
 * that fades in (Reveal), so the first screen never waits for the scripts on a slow phone. Reveal's own observer
 * takes over for the rest once the scripts load.
 */
export const revealNowScript = `try{var h=innerHeight;document.querySelectorAll('[data-reveal]').forEach(function(e){if(e.getBoundingClientRect().top<h)e.setAttribute('data-shown','')})}catch(e){}`;
