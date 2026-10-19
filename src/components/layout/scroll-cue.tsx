'use client';

/**
 * At the bottom of a page header: plain "Scroll down" text, so visitors who land on a tab know the page continues.
 * Clicking it scrolls to the first section below the header.
 */
export function ScrollCue() {
  return (
    <button
      type="button"
      onClick={(e) => {
        const next = e.currentTarget.closest('section')?.nextElementSibling;
        const top = next ? next.getBoundingClientRect().top + scrollY - 72 : innerHeight;
        scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }}
      aria-label="Scroll down to the page content"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium tracking-wide text-white/85 transition hover:text-white md:bottom-8 [text-shadow:0_1px_8px_rgb(0_0_0/0.45)]"
    >
      Scroll down
    </button>
  );
}
