import { Reveal } from '@/components/motion/reveal';

/** Page header shared by the inner pages: a deep forest-green gradient with topographic lines. */
export function PageHero({ label, title, lead, children }: { label: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#17402b_0%,#10301f_55%,#0b2418_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Topographic lines: concentric rings warped by a noise field, with a soft green glow */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 660" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#ffffff" strokeWidth={1.2}>
          <defs>
            <filter id="page-hero-topo">
              <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={2} seed={7} />
              <feDisplacementMap in="SourceGraphic" scale={130} />
            </filter>
          </defs>
          <g filter="url(#page-hero-topo)">
            <circle cx="1080" cy="290" r="50" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="86" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="122" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="158" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="194" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="230" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="266" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="302" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="338" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="374" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="410" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="446" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="482" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="518" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="554" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="590" strokeOpacity={0.055} />
            <circle cx="1080" cy="290" r="626" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="662" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="698" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="734" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="770" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="806" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="842" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="878" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="914" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="950" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="986" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1022" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1058" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1094" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1130" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1166" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1202" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1238" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1274" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1310" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1346" strokeOpacity={0.03} />
            <circle cx="1080" cy="290" r="1382" strokeOpacity={0.03} />
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
