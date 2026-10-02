import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';

/** Page header shared by the inner pages: a forest-green gradient, lighter than the near-black midnight. */
export function PageHero({ label, title, lead, children }: { label: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#1c4a32_0%,#143826_55%,#0f2c1e_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-56 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.26),transparent_62%)]" />
        {/* Left side: a soft mint glow and the capsule's orbit rings, so the copy never sits on a flat field */}
        <div className="absolute -bottom-72 -left-56 size-[820px] rounded-full bg-[radial-gradient(circle,rgb(143_209_169/0.16),transparent_60%)]" />
        <div className="absolute -left-40 -top-24 h-[280px] w-[820px] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgb(143_209_169/0.12),transparent)] blur-2xl" />
        <svg className="absolute -bottom-[550px] -left-[550px] h-[1100px] w-[1100px] text-white" viewBox="0 0 1100 1100" fill="none">
          <circle cx="550" cy="550" r="300" stroke="currentColor" strokeOpacity="0.09" />
          <circle cx="550" cy="550" r="400" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 10" strokeLinecap="round" />
          <circle cx="550" cy="550" r="500" stroke="currentColor" strokeOpacity="0.07" />
          {/* Facility nodes and the logo's red dot, kept in the margin clear of the copy */}
          <g className="hidden md:inline">
            <circle cx="628" cy="261" r="5" fill="#e4283c" fillOpacity="0.9" />
            <circle cx="637" cy="58" r="4" fill="#8fd1a9" fillOpacity="0.8" />
            <circle cx="944" cy="481" r="3.5" fill="#ffffff" fillOpacity="0.5" />
          </g>
        </svg>
        <div className="grid-fade absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_45%_55%_at_12%_85%,#000_10%,transparent_70%)]" />
        <NetworkCanvas className="absolute inset-0 opacity-70 [mask-image:linear-gradient(90deg,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0.2)_35%,#000_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f2c1e] to-transparent" />
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
