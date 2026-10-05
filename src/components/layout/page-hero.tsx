import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (title and one short line) on Wild Sand, with
 * a Flokefama photo (different per page) faded in on the right. Mirage text, accent words in the company green. No buttons: actions live in the page content.
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
  /** A Flokefama photo for this page's header, faded in on the right. */
  image?: string;
  /** CSS object-position for the photo. */
  position?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-sand text-ink">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Flokefama staff at work, on the right, dissolving into Wild Sand towards the text */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <Image src={image} alt="" fill priority sizes="62vw" className="object-cover" style={{ objectPosition: position }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#e4eef0_0%,#e4eef0_38%,rgb(228_238_240/0.85)_52%,rgb(228_238_240/0.45)_72%,rgb(228_238_240/0.3)_100%)] max-md:bg-[rgb(228_238_240/0.85)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sand/80 to-transparent" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal delay={0.06}>
            <h1 className="display text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-ink [&_span]:!text-brand-600">{title}</h1>
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
