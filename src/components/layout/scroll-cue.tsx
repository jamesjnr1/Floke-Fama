'use client';

/**
 * At the bottom of a page header: a bold white chevron pointing down, so visitors who land on a tab know the page continues.
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
      className="absolute bottom-5 left-1/2 grid size-12 -translate-x-1/2 place-items-center text-white/90 transition hover:translate-y-0.5 hover:text-white md:bottom-7"
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-9 drop-shadow-[0_1px_6px_rgb(0_0_0/0.5)]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9l7 7 7-7" />
      </svg>
    </button>
  );
}
