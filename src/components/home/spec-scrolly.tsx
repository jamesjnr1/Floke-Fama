'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * In-vitro diagnostics, told in four chapters. Every product named here is in the
 * current flokefama.com catalogue, and each chapter shows that product's own catalogue photo
 * (the last one, a photo of Flokefama's application specialists at a client lab, from the Media Centre).
 */
const chapters = [
  {
    label: '01 · Haematology',
    title: 'Complete blood counts, from clinic to teaching hospital.',
    body: 'Mindray BC-5150, BC-3000plus, BC-30s and BC-20s haematology analysers.',
    image: { src: '/images/products/auto-heamatology-analyzer-bc5150.webp', alt: 'Mindray BC-5150 auto haematology analyser', photo: false },
  },
  {
    label: '02 · Clinical chemistry',
    title: 'Chemistry with matched reagents.',
    body: 'Mindray semi-automated chemistry analysers, BS-230 cuvettes, reagents and controls.',
    image: { src: '/images/products/semi-automated-chemistry-analysermindray.webp', alt: 'Mindray BA-88A semi-automated chemistry analyser', photo: false },
  },
  {
    label: '03 · Urinalysis & microscopy',
    title: 'The everyday tests, done right.',
    body: 'UA-66 urine analysers and Olympus CX23 clinical microscopes.',
    image: { src: '/images/products/urine-analyzer-ua-66.webp', alt: 'UA-66 urine analyser', photo: false },
  },
  {
    label: '04 · Installed & supported',
    title: 'Calibrated on day one. Supported every day after.',
    body: 'Installation, calibration, preventive maintenance and training from engineers across six branches.',
    image: { src: '/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-2.webp', alt: 'Flokefama specialists with laboratory staff at a client facility', photo: true },
  },
];

/**
 * Canvas-pinned scrollytelling: the analyser stays in place while the chapters change
 * beside it (desktop). Mobile gets a simple stack.
 */
export function SpecScrolly() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(chapters.length - 1, Math.floor(v * chapters.length))));
  // Drift, don't rotate: rotation tilts the photo's frame and exposes its edges.
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.4]);

  return (
    <section className="bg-midnight text-white">
      {/* Desktop: pinned */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${chapters.length * 80 + 40}vh` }}>
        <div className="sticky top-0 grid h-svh grid-cols-2 items-center gap-10 overflow-hidden px-10 xl:px-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))]">
          <div className="relative z-10">
            <p className="label !text-brand-300">In-vitro diagnostics · Official Mindray distributor</p>
            <h2 className="display mt-5 text-6xl text-white xl:text-7xl">Diagnostics you can trust.</h2>
            <div className="relative mt-14 h-56" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <p className="label !text-white/40">{chapters[active].label}</p>
                  <p className="mt-4 max-w-lg text-4xl font-semibold tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.1]">{chapters[active].title}</p>
                  <p className="mt-4 max-w-md font-light text-white/60">{chapters[active].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex items-center gap-2" aria-hidden>
              {chapters.map((c, i) => (
                <span key={c.label} className={cn('h-1 rounded-full transition-all duration-500', i === active ? 'w-10 bg-brand-400' : 'w-4 bg-white/15')} />
              ))}
            </div>
            <Button asChild variant="glass" className="mt-10">
              <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
          </div>
          <div className="relative flex h-[80vh] items-center">
            <motion.div style={{ opacity: glow }} className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgb(82_181_124/0.3),transparent_65%)] blur-2xl" />
            <motion.div style={{ y }} className="relative aspect-[4/3.4] w-full overflow-hidden rounded-5xl bg-white shadow-[0_50px_100px_-40px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Stage image={chapters[active].image} sizes="(min-width: 1280px) 600px, 45vw" />
                </motion.div>
              </AnimatePresence>
              <p className="absolute bottom-5 left-6 z-10 rounded-full bg-midnight/85 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur">{chapters[active].image.alt}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="px-5 py-14 md:px-10 lg:hidden">
        <p className="label !text-brand-300">In-vitro diagnostics · Official Mindray distributor</p>
        <h2 className="display mt-4 text-[clamp(34px,10vw,48px)] text-white [overflow-wrap:anywhere]">Diagnostics you can trust.</h2>
        <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-4xl bg-white">
          <Stage image={chapters[0].image} sizes="100vw" />
        </div>
        <ol className="swipe-row mt-6">
          {chapters.map((c) => (
            <li key={c.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="label !text-white/40">{c.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{c.title}</p>
              <p className="mt-1 text-sm font-light text-white/60">{c.body}</p>
            </li>
          ))}
        </ol>
        <Button asChild variant="glass" className="mt-8">
          <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics</Link>
        </Button>
      </div>
    </section>
  );
}

function Stage({ image, sizes }: { image: (typeof chapters)[number]['image']; sizes: string }) {
  return image.photo ? (
    <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
  ) : (
    <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-contain p-[8%] mix-blend-multiply" />
  );
}
