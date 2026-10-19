'use client';

/**
 * At the bottom of a page header: "Scroll" with a small mouse whose wheel moves, so visitors who land on a tab know
 * the page continues. Clicking it scrolls to the first section below the header. Still if motion is reduced.
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
      className="group absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/85 transition hover:text-white md:bottom-8"
    >
      <span aria-hidden className="relative flex h-10 w-6 justify-center rounded-full border-2 border-current">
        <span className="mt-2 h-2 w-[3px] rounded-full bg-current motion-safe:animate-[scroll-cue_1.6s_ease-in-out_infinite]" />
      </span>
      <span className="text-[0.8125rem] font-medium uppercase tracking-[0.18em] [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">Scroll</span>
    </button>
  );
}
