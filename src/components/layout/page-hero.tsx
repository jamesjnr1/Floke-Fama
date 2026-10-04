import { OrbCanvas } from '@/components/layout/orb-canvas';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (label, title, one short line) on a deep-to-light
 * blue gradient, with a calm 3D wireframe sphere on the right. White text; accent words in soft mint.
 * No buttons: actions live in the page content.
 */
export function PageHero({ label, title, lead }: { label: string; title: React.ReactNode; lead?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#123a5c_0%,#1a5583_45%,#2f80b7_80%,#5aa3d4_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-40 top-1/2 size-[760px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.14),transparent_62%)]" />
        <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(8_30_52/0.45),transparent_65%)]" />
        <OrbCanvas className="absolute -right-24 top-1/2 size-[300px] -translate-y-1/2 opacity-25 md:right-[4%] md:size-[420px] md:opacity-100 lg:right-[8%] lg:size-[480px]" />
              </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal>
            <p className="label eyebrow !text-[#bfe0f5]">
              {label}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-white [&_span]:!text-brand-300">{title}</h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{lead}</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
