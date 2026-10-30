import Image from 'next/image';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Reveal } from '@/components/motion/reveal';
import { ScrollCue } from '@/components/layout/scroll-cue';
import { headerImagePhoneSrc, headerImageSrc } from '@/lib/header-image';

/**
 * Page header shared by the inner pages: the page's photo fills the whole header under a light veil, with a large
 * centred title. The accent words (`<em>` in the title) are set in an italic serif. Information only: actions live
 * in the page content.
 */
export function PageHero({
  title,
  lead,
  image = '/images/news/the-forgotten-stage-of-quality-cover.webp',
  position = '50% 40%',
  flip = false,
  veil,
  kicker,
  badge,
}: {
  /** Kept for the callers; the small label above the title is no longer shown. */
  label?: string;
  title: React.ReactNode;
  lead?: string;
  /** The photo for this page's header. */
  image?: string;
  /** CSS object-position for the photo. */
  position?: string;
  /** Mirror the photo (only for photos without text). */
  flip?: boolean;
  /** 'strong': a darker veil, so white text reads on a bright photo. */
  veil?: 'strong';
  /** A line under the logo, above the title (e.g. "Corporate Social Responsibility"). */
  kicker?: string;
  /** Optional highlighted message displayed beneath the company wordmark. */
  badge?: string;
}) {
  return (
    <section className="relative isolate grid min-h-[34rem] place-items-center overflow-hidden bg-[#10191e] text-center text-white md:min-h-[min(47.5rem,92svh)]">
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* Phones get the smaller copy of the photo */}
        <picture>
          <source media="(max-width: 767px)" srcSet={headerImagePhoneSrc(image)} />
          <Image src={headerImageSrc(image)} alt="" fill priority unoptimized className={flip ? '-scale-x-100 object-cover' : 'object-cover'} style={{ objectPosition: position }} />
        </picture>
        {/* Light veil, as on youversion.com: the photo stays vivid; a little deeper behind the menu and the title */}
        {veil === 'strong' ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_20_14/0.72)_0%,rgb(6_20_14/0.55)_35%,rgb(6_20_14/0.6)_65%,rgb(6_20_14/0.8)_100%)]" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_16_20/0.5)_0%,rgb(10_16_20/0.22)_30%,rgb(10_16_20/0.3)_60%,rgb(10_16_20/0.62)_100%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_55%,rgb(10_16_20/0.28),transparent_75%)]" />
      </div>
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-36 md:px-16 md:pb-24 md:pt-40">
        <Reveal>
          {/* The company name over every page title */}
          <p className="inline-flex items-center gap-2 [filter:drop-shadow(0_2px_12px_rgb(0_0_0/0.35))]">
            <LogoMark className="size-9 md:size-11" />
            <LogoWordmark className="h-[22px] text-white md:h-[26px]" />
            <span className="sr-only">Flokefama</span>
          </p>
          {kicker && <p className="mt-3 text-[0.9375rem] font-semibold uppercase tracking-[0.18em] text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.4)] md:text-base">{kicker}</p>}
          {badge && <p className="mx-auto mt-5 inline-flex items-center rounded-lg bg-[#E5252A] px-[18px] py-[10px] text-sm font-semibold text-white shadow-lg md:text-base">{badge}</p>}
        </Reveal>
        <Reveal delay={0.06} className="mt-6">
          <h1 className="mx-auto max-w-5xl text-balance text-[clamp(2.5rem,1.1rem+4.6vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.35)] [&_em]:font-serif [&_em]:font-normal [&_em]:tracking-[-0.01em]">
            {title}
          </h1>
        </Reveal>
        {lead && (
          <Reveal delay={0.12}>
            <p className="no-justify mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 [text-shadow:0_1px_16px_rgb(0_0_0/0.4)] md:text-xl">{lead}</p>
          </Reveal>
        )}
      </div>
      <ScrollCue />
    </section>
  );
}
