'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const chapters = (p: Product) => [
  { label: '01 · Automation', title: 'Walk-away chemistry.', body: p.highlights[0] ?? p.summary },
  ...p.specs.slice(0, 3).map((s, i) => ({ label: `0${i + 2} · ${s.label}`, title: s.value, body: '' })),
];

/**
 * Canvas-pinned scrollytelling: the analyser stays locked in place while
 * technical chapters fade in and out beside it (desktop). Mobile gets a simple stack.
 */
export function SpecScrolly({ product }: { product: Product }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const items = chapters(product);
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(items.length - 1, Math.floor(v * items.length))));
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 0.94]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 3]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.4]);

  return (
    <section className="bg-midnight text-white">
      {/* Desktop: pinned */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${items.length * 80 + 40}vh` }}>
        <div className="sticky top-0 grid h-svh grid-cols-2 items-center gap-10 overflow-hidden px-10 xl:px-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))]">
          <div className="relative z-10">
            <p className="label !text-surgical-300">Flagship · {product.brand}</p>
            <h2 className="display mt-5 text-6xl text-white xl:text-7xl">{product.name.replace(' Chemistry Analyser', '')}</h2>
            {/* One chapter at a time, driven by scroll position */}
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
                  <p className="label !text-white/40">{items[active].label}</p>
                  <p className="mt-4 max-w-lg text-4xl font-semibold tracking-tight text-white xl:text-5xl">{items[active].title}</p>
                  {items[active].body && <p className="mt-4 max-w-md font-light text-white/60">{items[active].body}</p>}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex items-center gap-2" aria-hidden>
              {items.map((c, i) => (
                <span key={c.label} className={cn('h-1 rounded-full transition-all duration-500', i === active ? 'w-10 bg-surgical-400' : 'w-4 bg-white/15')} />
              ))}
            </div>
            <Button asChild variant="glass" className="mt-10">
              <Link href={`/products/${product.slug}`}>Open the deep spec sheet <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
            {!product.specsVerified && <p className="mt-4 text-xs text-white/35">Indicative specifications. Confirm with our applications team.</p>}
          </div>
          <div className="relative h-[80vh]">
            <motion.div style={{ opacity: glow }} className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgb(52_199_123/0.35),transparent_65%)] blur-2xl" />
            {product.image && (
              <motion.div style={{ scale, rotate }} className="absolute inset-0">
                <Image src={product.image} alt={`${product.brand} ${product.name}`} fill sizes="50vw" className="object-contain [mask-image:linear-gradient(90deg,transparent,#000_30%)]" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="px-5 py-24 md:px-10 lg:hidden">
        <p className="label !text-surgical-300">Flagship · {product.brand}</p>
        <h2 className="display mt-4 text-5xl text-white">{product.name}</h2>
        {product.image && (
          <div className="relative mt-8 aspect-[4/3]">
            <Image src={product.image} alt="" fill sizes="100vw" className="object-contain" />
          </div>
        )}
        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {product.specs.map((s) => (
            <div key={s.label} className="flex justify-between gap-6 py-4 text-sm">
              <dt className="text-white/50">{s.label}</dt>
              <dd className="text-right font-medium text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
        <Button asChild variant="glass" className="mt-8">
          <Link href={`/products/${product.slug}`}>Open the deep spec sheet</Link>
        </Button>
      </div>
    </section>
  );
}
