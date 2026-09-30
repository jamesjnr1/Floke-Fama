'use client';

import { motion } from 'motion/react';
import { CountUp } from '@/components/motion/count-up';
import { Icon } from '@/components/ui/icon';
import type { Metric } from '@/lib/types';

/** "Enterprise Metrics Tracker": CMS-driven key figures in a glass instrument panel. */
export function MetricsTracker({ metrics }: { metrics: Metric[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 1200 }}
      className="glass relative overflow-hidden rounded-4xl p-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)]"
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-3">
        <p className="label !text-white/50">Enterprise metrics</p>
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-surgical-300">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-surgical-400 opacity-60" />
            <span className="relative size-2 rounded-full bg-surgical-400" />
          </span>
          Live from CMS
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col-reverse rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.07] to-white/[0.015] p-5"
          >
            <dt className="mt-2 text-xs text-white/55">
              {m.label}
              {m.caption && <span className="mt-0.5 block text-[11px] text-white/35">{m.caption}</span>}
            </dt>
            <dd className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </dd>
          </motion.div>
        ))}
      </dl>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-3 rounded-3xl bg-surgical-600/20 p-4 ring-1 ring-surgical-400/20">
          <Icon name="fi-rr-award" className="text-xl text-surgical-300" />
          <p className="text-sm leading-tight text-white">
            Ghana Club 100<span className="block text-[11px] text-white/50">Ranked company</span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
          <Icon name="fi-rr-trophy" className="text-xl text-surgical-300" />
          <p className="text-sm leading-tight text-white">
            Best in IVD 2026<span className="block text-[11px] text-white/50">Mindray Central Africa</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
