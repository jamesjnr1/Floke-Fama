'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { prefersReducedMotion } from '@/lib/a11y';

/**
 * Flokefama's films in public/videos, played in this order: the full story, then the highlights, then round
 * again. Each comes in two versions: `hd` (1600 px wide, carefully upscaled and sharpened) for large screens,
 * where the 1024 px originals look soft when stretched, and `src` (the originals' size) for phones and slow
 * connections. The letterbox bands above and below the picture are trimmed off (the subtitles were in the lower band).
 */
const films = [
  { title: 'The Flokefama story', src: '/videos/flokefama-story.mp4', hd: '/videos/flokefama-story-hd.mp4' },
  { title: 'Flokefama highlights', src: '/videos/flokefama-highlights.mp4', hd: '/videos/flokefama-highlights-hd.mp4' },
];
const poster = '/videos/flokefama-story-poster.webp';

/** Data Saver or a 2G connection: don't start a film on its own. */
const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || /2g/.test(c?.effectiveType ?? ''));
};

/**
 * Home, directly below the hero: a film of Flokefama at work, edge to edge, with a small title and a Watch video
 * button on it. It loads and starts (muted, no controls) once it is scrolled into view, pauses when it leaves,
 * and runs from the full story straight into the highlights; Watch video starts it again from the beginning with
 * sound and the browser's controls. Visitors who asked for less motion, or are on Data Saver, see the
 * cover frame and press play themselves.
 */
export function SolutionsInAction({ layout = 'wide', plain = false }: { layout?: 'wide' | 'feature'; /** No background pattern (the structured home page) */ plain?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [load, setLoad] = useState(false);
  const [hd, setHd] = useState(false);
  // The wide layout plays as a silent backdrop until the visitor presses Watch video
  const [watching, setWatching] = useState(layout !== 'wide');

  // Large screens on a normal connection get the sharper HD version
  useEffect(() => setHd(window.matchMedia('(min-width: 1024px)').matches && !saveData()), []);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const auto = !prefersReducedMotion() && !saveData();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // First time in view: give it its source and let it start as soon as it can
          if (!v.getAttribute('src')) {
            v.autoplay = auto;
            setLoad(true);
          } else if (auto || v.autoplay) v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    // Once playing (on its own or by the visitor), the next film follows straight on
    const follow = () => {
      v.autoplay = true;
    };
    v.addEventListener('play', follow);
    return () => {
      io.disconnect();
      v.removeEventListener('play', follow);
    };
  }, []);

  const film = films[current];
  const player = (className: string) => (
    <video
      ref={video}
      src={load ? (hd ? film.hd : film.src) : undefined}
      poster={poster}
      muted={!watching}
      controls={watching}
      // No download button or picture-in-picture (the CEO: protect our media)
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      playsInline
      preload="none"
      onEnded={() => setCurrent((i) => (i + 1) % films.length)}
      aria-label={`${film.title}. Flokefama films: the full story, then the highlights.`}
      className={className}
    />
  );

  // 'wide': the film edge to edge, playing silently, with a small title and Watch video on it
  const watch = () => {
    const v = video.current;
    if (!v) return;
    setLoad(true);
    setWatching(true);
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  // "Watch our highlight video" on the hero links here: start the film from the beginning, with sound
  useEffect(() => {
    if (layout !== 'wide') return;
    const go = () => {
      if (location.hash === '#highlight-video') watch();
    };
    window.addEventListener('hashchange', go);
    go();
    return () => window.removeEventListener('hashchange', go);
  }, [layout]);

  // 'feature': the text on the left, the film on the right over an offset green block (the structured home page)
  if (layout === 'feature') {
    return (
      <section aria-labelledby="in-action-title" className="bg-paper section-y">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="label">See us at work</p>
            <h2 id="in-action-title" className="display mt-3 text-[clamp(2rem,1.2rem+2.4vw,3rem)] text-ink">
              Healthcare Solutions in Action
            </h2>
            <p className="no-justify mt-5 text-lg leading-relaxed text-ink-3">
              From our laboratories and warehouse in Accra to hospitals across Ghana and West Africa: see how Flokefama supplies, installs and maintains the equipment that keeps care running.
            </p>
            <Link href="/about#ceo" className="group mt-7 inline-flex items-center gap-2 bg-brand-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-800">
              A message from our CEO
              <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
          <Reveal delay={0.08} className="relative pb-8 pr-8 md:pb-10 md:pr-10">
            <div aria-hidden className="absolute bottom-0 right-0 top-10 left-10 bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] md:left-14 md:top-14" />
            {player('relative block aspect-[1024/436] w-full bg-black shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]')}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="highlight-video" aria-labelledby="in-action-title" className={`${plain ? 'pb-16 md:pb-28 ' : 'pattern-grid '}scroll-mt-16 bg-paper pt-16 md:pt-32`}>
      <div className="relative isolate overflow-hidden bg-black">
        {/* The whole frame on every screen; on phones the title sits under the film instead of on it */}
        {player('block aspect-[1024/436] w-full object-cover')}
        {!watching && (
          <div className="flex flex-col items-center px-5 py-6 text-center sm:absolute sm:inset-0 sm:justify-end sm:bg-[linear-gradient(180deg,transparent_40%,rgb(0_0_0/0.65)_100%)] sm:py-0 sm:pb-10 md:pb-16">
            <h2 id="in-action-title" className="text-[clamp(1.75rem,1.1rem+2vw,3rem)] font-bold leading-tight tracking-[-0.02em] !text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.4)]">
              Healthcare Solutions in Action
            </h2>
            <button type="button" onClick={watch} className="mt-4 inline-flex items-center gap-2 text-lg font-medium text-white transition-opacity hover:opacity-80">
              Watch video <Icon name="fi-rr-play-circle" className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
