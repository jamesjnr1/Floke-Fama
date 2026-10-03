import { NetworkCanvas } from '@/components/home/network-canvas';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (label, title, one short line), on the
 * same deep green and node mesh as the home hero. No buttons: actions live in the page content.
 */
export function PageHero({ label, title, lead }: { label: string; title: React.ReactNode; lead?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#17402b_0%,#10301f_55%,#0b2418_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-52 -top-52 size-[900px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.22),transparent_62%)]" />
        <NetworkCanvas className="absolute inset-0 opacity-40 md:opacity-80 [mask-image:linear-gradient(90deg,transparent_0%,transparent_30%,#000_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b2418] to-transparent" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <Reveal>
          <p className="label flex items-center gap-3 !text-brand-300">
            <span className="status-dot" aria-hidden /> {label}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="display mt-5 max-w-4xl text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-white">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">{lead}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
