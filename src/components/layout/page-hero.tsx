import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';

/**
 * Page header shared by the inner pages: information only (label, title, one short line) on Wild Sand, with
 * a photo of Flokefama staff at work (different on each page) faded in on the right. Mirage text, accent words in the company green. No buttons: actions live in the page content.
 */
export function PageHero({ label, title, lead, image = '/images/news/the-forgotten-stage-of-quality-cover.webp', imagePosition = '50% 35%' }: { label: string; title: React.ReactNode; lead?: string; image?: string; imagePosition?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-sand text-ink">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Flokefama staff at work, on the right, dissolving into Wild Sand towards the text */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <Image src={image} alt="" fill priority sizes="62vw" className="object-cover" style={{ objectPosition: imagePosition }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#e4eef0_0%,#e4eef0_38%,rgb(228_238_240/0.85)_52%,rgb(228_238_240/0.45)_72%,rgb(228_238_240/0.3)_100%)] max-md:bg-[rgb(228_238_240/0.85)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sand/80 to-transparent" />
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-32 md:px-16 md:pb-20 md:pt-44">
        <div className="max-w-2xl lg:max-w-3xl">
          <Reveal>
            <p className="label eyebrow">
              {label}
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 text-[clamp(2.25rem,1.2rem+3.4vw,4rem)] uppercase leading-[0.98] text-ink [&_span]:!text-brand-600">{title}</h1>
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
