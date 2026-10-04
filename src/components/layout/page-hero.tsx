import Image from 'next/image';
import { OrbCanvas } from '@/components/layout/orb-canvas';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (label, title, one short line) on Ice, with the
 * Flokefama head office faded in on the right and the calm 3D wireframe sphere over it. Move Green text,
 * accent words in deep orange. No buttons: actions live in the page content.
 */
export function PageHero({ label, title, lead }: { label: string; title: React.ReactNode; lead?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-ice text-ink">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* The head office, on the right, dissolving into Ice towards the text */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <Image src="/images/head-office.webp" alt="" fill priority sizes="62vw" className="object-cover object-[50%_42%] opacity-80 saturate-[0.8]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#bff2f0_0%,#bff2f0_38%,rgb(191_242_240/0.85)_52%,rgb(191_242_240/0.45)_72%,rgb(191_242_240/0.3)_100%)] max-md:bg-[rgb(191_242_240/0.85)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ice/80 to-transparent" />
        <OrbCanvas className="absolute -right-24 top-1/2 size-[300px] -translate-y-1/2 opacity-20 md:right-[4%] md:size-[420px] md:opacity-90 lg:right-[8%] lg:size-[460px]" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal>
            <p className="label eyebrow">
              {label}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-ink [&_span]:!text-signal-700">{title}</h1>
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
