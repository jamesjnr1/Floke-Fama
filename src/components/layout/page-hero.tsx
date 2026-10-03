import { OrbCanvas } from '@/components/layout/orb-canvas';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (label, title, one short line) on a light
 * background (white, mint and a hint of logo red), with a calm 3D sphere on the right. No buttons: actions live in the page content.
 */
export function PageHero({ label, title, lead }: { label: string; title: React.ReactNode; lead?: string }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-[linear-gradient(135deg,#f6faf7_0%,#eaf4ee_60%,#f9f1f1_100%)] text-ink">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 top-1/2 size-[760px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.16),transparent_62%)]" />
        <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(228_40_60/0.07),transparent_65%)]" />
        <OrbCanvas className="absolute -right-24 top-1/2 size-[300px] -translate-y-1/2 opacity-25 md:right-[4%] md:size-[420px] md:opacity-100 lg:right-[8%] lg:size-[480px]" />
              </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal>
            <p className="label flex items-center gap-3">
              <span className="status-dot" aria-hidden /> {label}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-ink">{title}</h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{lead}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
