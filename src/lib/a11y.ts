/** Accessibility preferences: stored per visitor and applied as data attributes on <html>. */
export type TextSize = 'standard' | 'large' | 'larger';
export interface A11ySettings {
  text: TextSize;
  contrast: boolean;
  motion: boolean; // true = reduce motion
  links: boolean; // underline links
  font: boolean; // readable font
}

export const A11Y_KEY = 'ff-a11y';
export const defaultA11y: A11ySettings = { text: 'standard', contrast: false, motion: false, links: false, font: false };

export function applyA11y(s: A11ySettings) {
  const d = document.documentElement.dataset;
  d.text = s.text;
  d.contrast = s.contrast ? 'high' : '';
  d.motion = s.motion ? 'reduce' : '';
  d.links = s.links ? 'underline' : '';
  d.font = s.font ? 'readable' : '';
}

/** True when the visitor asked for less motion, here or in their OS settings. */
export const prefersReducedMotion = () =>
  document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs in <head> before first paint, so saved preferences never flash. */
/**
 * Runs as soon as the page's HTML has arrived, before the JavaScript bundles: shows everything already on screen
 * that fades in (Reveal), so the first screen never waits for the scripts on a slow phone. Reveal's own observer
 * takes over for the rest once the scripts load.
 */
export const revealNowScript = `try{var h=innerHeight;document.querySelectorAll('[data-reveal]').forEach(function(e){if(e.getBoundingClientRect().top<h)e.setAttribute('data-shown','')})}catch(e){}`;

export const a11yBootScript = `try{var s=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'null');if(s){var d=document.documentElement.dataset;d.text=s.text||'standard';d.contrast=s.contrast?'high':'';d.motion=s.motion?'reduce':'';d.links=s.links?'underline':'';d.font=s.font?'readable':'';}}catch(e){}if('IntersectionObserver' in window)document.documentElement.setAttribute('data-reveal-ready','');`;
