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
 * Home, directly below the hero: a wide film of Flokefama at work. It loads and starts (muted) once it is
 * scrolled into view, pauses when it leaves, and runs from the full story straight into the highlights; the
 * browser's controls turn the sound on. Visitors who asked for less motion, or are on Data Saver, see the
 * cover frame and press play themselves.
 */
export function SolutionsInAction({ layout = 'wide', plain = false }: { layout?: 'wide' | 'feature'; /** No background pattern (the structured home page) */ plain?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [load, setLoad] = useState(false);
  const [hd, setHd] = useState(false);

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
      muted
      controls
      playsInline
      preload="none"
      onEnded={() => setCurrent((i) => (i + 1) % films.length)}
      aria-label={`${film.title}. Flokefama films: the full story, then the highlights.`}
      className={className}
    />
  );

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
    <section aria-labelledby="in-action-title" className={`${plain ? '' : 'pattern-grid '}bg-paper pt-16 md:pt-32`}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <h2 id="in-action-title" className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-ink">
              Healthcare Solutions in Action
            </h2>
            {/* A small text link to the CEO's profile and message on the About page */}
            <Link href="/about#ceo" className="group mt-4 inline-flex items-center gap-1.5 text-[1.0625rem] font-semibold text-brand-700 transition-colors hover:text-brand-800">
              <span className="underline decoration-brand-700/30 underline-offset-4 group-hover:decoration-brand-800">A message from our CEO</span>
              <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="no-justify max-w-xl text-lg leading-relaxed text-ink-3">
            From our laboratories and warehouse in Accra to hospitals across Ghana and West Africa: see how Flokefama supplies, installs and maintains the equipment that keeps care running.
          </p>
        </Reveal>

        {/* The film spans the text column exactly (from where the heading starts to where the intro ends), square-cornered, shown whole */}
        <Reveal delay={0.08} className="mt-10 md:mt-14">
          {player('block aspect-[1024/436] w-full bg-black')}
        </Reveal>
      </div>
    </section>
  );
}
