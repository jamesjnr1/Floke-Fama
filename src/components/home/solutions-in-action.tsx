'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { prefersReducedMotion } from '@/lib/a11y';
import { cn } from '@/lib/utils';

/** Flokefama's films, encoded for the web in public/videos with their cover frames. */
const films = [
  { id: 'highlights', label: 'Highlights', length: '1:38', src: '/videos/flokefama-highlights.mp4', poster: '/videos/flokefama-highlights-poster.webp' },
  { id: 'story', label: 'The full story', length: '3:28', src: '/videos/flokefama-story.mp4', poster: '/videos/flokefama-story-poster.webp' },
];

/** Data Saver or a 2G connection: don't start a film on its own. */
const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || /2g/.test(c?.effectiveType ?? ''));
};

/**
 * Home, directly below the hero: a wide film of Flokefama at work. It loads and starts (muted) once it is
 * scrolled into view and pauses when it leaves; the browser's controls turn the sound on. Visitors who asked
 * for less motion, or are on Data Saver, get the cover frame and press play themselves.
 */
export function SolutionsInAction() {
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [load, setLoad] = useState(false);
  const film = films[active];

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const auto = !prefersReducedMotion() && !saveData();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const play = auto && active === 0;
          // First time in view: give it its source and let it start as soon as it can
          if (!v.getAttribute('src')) {
            v.autoplay = play;
            setLoad(true);
          } else if (play) v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [active]);

  // A film the visitor picks plays straight away, with sound
  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    setLoad(true);
  };

  return (
    <section aria-labelledby="in-action-title" className="bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <h2 id="in-action-title" className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-ink">
            Healthcare Solutions in Action
          </h2>
          <p className="no-justify max-w-xl text-lg leading-relaxed text-ink-3">
            From our laboratories and warehouse in Accra to hospitals across Ghana and West Africa: see how Flokefama supplies, installs and maintains the equipment that keeps care running.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 md:mt-14">
          <video
            ref={video}
            key={film.id}
            src={load ? film.src : undefined}
            poster={film.poster}
            muted={active === 0}
            loop={active === 0}
            autoPlay={active !== 0}
            controls
            playsInline
            preload="none"
            aria-label={`Flokefama: ${film.label.toLowerCase()} (${film.length})`}
            className="aspect-video w-full rounded-lg bg-black"
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" role="tablist" aria-label="Films">
            {films.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => choose(i)}
                className={cn('font-medium transition', i === active ? 'text-ink underline decoration-signal decoration-2 underline-offset-[6px]' : 'text-ink-3 hover:text-ink')}
              >
                {f.label} <span className="text-ink-3">· {f.length}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
