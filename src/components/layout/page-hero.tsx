import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';

/** Page header shared by the inner pages: a forest-green gradient, lighter than the near-black midnight. */
export function PageHero({ label, title, lead, children }: { label: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#1c4a32_0%,#143826_55%,#0f2c1e_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-56 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.26),transparent_62%)]" />
        <div className="grid-fade absolute inset-0 opacity-60" />
        <NetworkCanvas className="absolute inset-0 opacity-70 [mask-image:linear-gradient(90deg,transparent_0%,transparent_40%,#000_75%)]" />
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
