/** True when the visitor's device asks for less motion. */
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs in <head> before first paint: lets the fade-ins (Reveal) start hidden only where they can be shown again. */
export const bootScript = `if('IntersectionObserver' in window)document.documentElement.setAttribute('data-reveal-ready','');`;

/**
 * Runs as soon as the page's HTML has arrived, before the JavaScript bundles: shows everything already on screen
 * that fades in (Reveal), so the first screen never waits for the scripts on a slow phone. Reveal's own observer
 * takes over for the rest once the scripts load.
 */
export const revealNowScript = `try{var h=innerHeight;document.querySelectorAll('[data-reveal]').forEach(function(e){if(e.getBoundingClientRect().top<h)e.setAttribute('data-shown','')})}catch(e){}`;
