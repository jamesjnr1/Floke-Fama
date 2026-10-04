import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/**
 * Inner-page opening, told as a short sequence of panels (after mPharma's “Our vision” page): one idea per
 * panel, big type, very little text.
 *   statement: a large centred statement on the calm page background (always first; it holds the h1)
 *   photo:     a full-bleed real Flokefama photo with white text over a navy shade
 *   colour:    a bold colour panel (navy, green or red) with one line in white
 * Text colours are fixed per panel: dark navy on the light statement, white on photo and colour panels.
 */
export type StoryPanel =
  | { kind: 'photo'; title: string; text?: string; image: string; position?: string }
  | { kind: 'colour'; title: string; text?: string; tone: 'navy' | 'green' | 'red' };

const toneClass = { navy: 'bg-navy', green: 'bg-brand-600', red: 'bg-signal' } as const;

export function StoryPanels({ label, title, lead, panels = [] }: { label: string; title: React.ReactNode; lead?: string; panels?: StoryPanel[] }) {
  return (
    <>
      {/* 1. The statement */}
      <section className="relative isolate flex min-h-[60svh] items-center overflow-hidden bg-canvas pb-14 pt-32 md:min-h-[72svh] md:pb-20 md:pt-36">
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-600)_10%,transparent),transparent_65%)]" />
        <div aria-hidden className="absolute -bottom-40 -left-32 -z-10 size-[460px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-navy)_9%,transparent),transparent_65%)]" />
        <div className="mx-auto w-full max-w-[1100px] px-5 text-center md:px-10">
          <Reveal>
            <p className="label eyebrow justify-center">{label}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mx-auto mt-6 max-w-4xl text-[clamp(2.5rem,1.3rem+4.2vw,5rem)] text-ink [&_span]:text-brand-600">{title}</h1>
          </Reveal>
          {lead && (
            <Reveal delay={0.12}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 md:text-xl">{lead}</p>
            </Reveal>
          )}
        </div>
      </section>

      {panels.map((p) =>
        p.kind === 'photo' ? (
          // 2. A real photo, full bleed, one line over it
          <section key={p.title} className="relative isolate flex min-h-[64svh] items-end overflow-hidden text-white md:min-h-[78svh]">
            <Image src={p.image} alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: p.position ?? '50% 50%' }} />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--color-midnight)_88%,transparent)_0%,color-mix(in_srgb,var(--color-midnight)_45%,transparent)_45%,transparent_75%)]" />
            <div className="mx-auto w-full max-w-[1280px] px-5 pb-12 md:px-10 md:pb-20">
              <Reveal className="max-w-2xl">
                <h2 className="display text-[clamp(2rem,1.2rem+3vw,3.75rem)] text-white">{p.title}</h2>
                {p.text && <p className="mt-4 text-lg leading-relaxed text-white/90 md:text-xl">{p.text}</p>}
              </Reveal>
            </div>
          </section>
        ) : (
          // 3. A bold colour panel, one line in white
          <section key={p.title} className={cn('flex min-h-[44svh] items-center py-16 text-white md:min-h-[56svh] md:py-24', toneClass[p.tone])}>
            <Reveal className="mx-auto w-full max-w-[1000px] px-5 text-center md:px-10">
              <h2 className="display text-[clamp(2rem,1.2rem+3vw,3.75rem)] text-white">{p.title}</h2>
              {p.text && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">{p.text}</p>}
            </Reveal>
          </section>
        ),
      )}
    </>
  );
}
