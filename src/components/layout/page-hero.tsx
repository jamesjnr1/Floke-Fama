import { Reveal } from '@/components/motion/reveal';

/** Page header shared by the inner pages: a deep forest-green gradient with topographic lines. */
export function PageHero({ label, title, lead, children }: { label: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#17402b_0%,#10301f_55%,#0b2418_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Topographic lines: concentric rings warped by a noise field, with a soft green glow */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#ffffff" strokeWidth={1.2}>
          <defs>
            <filter id="page-hero-topo">
              <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={2} seed={7} />
              <feDisplacementMap in="SourceGraphic" scale={160} />
            </filter>
          </defs>
          <g filter="url(#page-hero-topo)">
            <circle cx="1150" cy="300" r="60" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="98" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="136" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="174" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="212" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="250" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="288" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="326" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="364" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="402" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="440" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="478" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="516" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="554" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="592" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="630" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="668" strokeOpacity={0.14} />
            <circle cx="1150" cy="300" r="706" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="744" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="782" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="820" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="858" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="896" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="934" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="972" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1010" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1048" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1086" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1124" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1162" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1200" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1238" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1276" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1314" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1352" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1390" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1428" strokeOpacity={0.08} />
            <circle cx="1150" cy="300" r="1466" strokeOpacity={0.08} />
          </g>
        </svg>
        <div className="absolute -right-52 -top-52 size-[900px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.22),transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b2418] to-transparent" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-28 md:pt-48">
        <Reveal>
          <p className="label flex items-center gap-3 !text-brand-300">
            <span className="status-dot" aria-hidden /> {label}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="display mt-6 max-w-4xl text-[clamp(2.5rem,1.2rem+4.2vw,4.75rem)] uppercase leading-[0.96] text-white">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">{lead}</p>
          </Reveal>
        )}
        {children && <Reveal delay={0.18} className="mt-10">{children}</Reveal>}
      </div>
    </section>
  );
}
