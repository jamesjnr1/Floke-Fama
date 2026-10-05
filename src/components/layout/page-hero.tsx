import Image from 'next/image';
import { MeshLines } from '@/components/layout/mesh-lines';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages, in the site colours: the hero's deep Mirage → Deep Sea field, with a
 * photo (different per page) dissolving into it from the right. White title, accent words in soft green.
 * Information only: actions live in the page content.
 */
export function PageHero({
  title,
  lead,
  image = '/images/news/the-forgotten-stage-of-quality-cover.webp',
  position = '60% 35%',
}: {
  /** Kept for the callers; the small label above the title is no longer shown. */
  label?: string;
  title: React.ReactNode;
  lead?: string;
  /** The photo for this page's header, faded in on the right. */
  image?: string;
  /** CSS object-position for the photo. */
  position?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#10191e_0%,#16232a_45%,#0b3b40_100%)] text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-y-0 right-0 w-full md:w-[60%]">
          <Image src={image} alt="" fill priority sizes="60vw" className="object-cover" style={{ objectPosition: position }} />
        </div>
        {/* The photo fades into the dark field towards the text */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#121e24_0%,#121e24_38%,rgb(18_30_36/0.82)_55%,rgb(14_44_48/0.45)_78%,rgb(11_59_64/0.25)_100%)] max-md:bg-[rgb(18_30_36/0.8)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#10191e]/80 to-transparent" />
        {/* Faint green mesh on the left, fading out before the photo */}
        <MeshLines className="absolute inset-y-0 left-0 h-full w-full opacity-[0.28] [mask-image:linear-gradient(90deg,#000_0%,#000_20%,transparent_50%)] md:w-[75%]" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal delay={0.06}>
            <h1 className="display text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-white [&_span]:!text-brand-300">{title}</h1>
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
