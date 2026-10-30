'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { useSite } from '@/components/site-provider';
import Image from 'next/image';
import { UserRound } from 'lucide-react';

/**
 * The reviewer's photo (Studio: Site content → Home → Testimonials → Photo), or a placeholder until one is added.
 */
function Portrait({ photo, name, sizes, small }: { photo?: string; name: string; sizes: string; small?: boolean }) {
  if (photo) return <Image src={photo} alt={small ? '' : name} fill sizes={sizes} className="object-cover object-top" />;
  return (
    <span aria-hidden={small || undefined} role={small ? undefined : 'img'} aria-label={small ? undefined : `${name}: photo coming soon`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(160deg,#e8f3ec,#d3e7db)] text-brand-800/50">
      <UserRound className={small ? 'size-7' : 'size-24'} strokeWidth={1.25} />
      {!small && <span className="text-sm font-medium text-brand-800/70">Photo coming soon</span>}
    </span>
  );
}

/** Testimonials: the reviewer's photo large beside their quote, everyone who gave a review below as a selector. */
export function Testimonials() {
  const { testimonials } = useSite();
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const t = testimonials[active];

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % testimonials.length), 8000);
    return () => clearTimeout(id);
  }, [active, reduce, testimonials.length]);

  return (
    <section id="testimonials" className="pattern-dots pattern-soft pattern-l scroll-mt-28 bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="display max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">Hear what our customers say.</h2>
          <p className="no-justify mt-4 max-w-2xl text-center text-lg leading-relaxed text-ink-3">Don’t just take our word for it—hear from our satisfied customers! Here’s what they have to say about their experience with Flokefama.</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-14 max-w-5xl">
            {/* The person who gave the review, large beside their words */}
            <figure className="grid overflow-hidden border border-line bg-paper shadow-[0_40px_80px_-50px_rgb(11_21_16/0.4)] md:grid-cols-[0.85fr_1.4fr]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`photo-${active}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative aspect-[4/5] max-h-[380px] w-full md:aspect-auto md:max-h-none md:min-h-[420px]"
                >
                  <Portrait photo={t.photo} name={t.name} sizes="(min-width: 768px) 380px, 100vw" />
                </motion.div>
              </AnimatePresence>
              <div className="relative flex flex-col p-8 md:p-12">
                <span aria-hidden className="pointer-events-none absolute -top-6 left-6 select-none font-mono text-[10rem] leading-none text-brand-600/10">“</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex h-full flex-col justify-between"
                    aria-live="polite"
                  >
                    <blockquote className="text-xl font-medium leading-relaxed tracking-[-0.01em] text-ink md:text-2xl">“{t.quote}”</blockquote>
                    <figcaption className="mt-10">
                      <span className="block text-lg font-semibold text-ink">{t.name}</span>
                      <span className="text-sm text-ink-3">{t.role}</span>
                    </figcaption>
                  </motion.div>
                </AnimatePresence>
              </div>
            </figure>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
