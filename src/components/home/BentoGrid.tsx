import Image from 'next/image';
import Link from 'next/link';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import type { Metric } from '@/lib/types';

/**
 * Insights Deck: 12-column bento, three span-4 cards (1px stroke, 24px radius).
 * 01 Institutional impact · 02 Featured device · 03 Media.
 */
export function BentoGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section id="impact" className="scroll-mt-28 bg-canvas py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">Insights deck</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.75rem)]">Impact you can measure. Technology you can trust.</h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Card_01_Impact */}
          <Reveal className="lg:col-span-4">
            <article className="relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-3xl border border-line bg-paper p-7">
              <p className="label">Our institutional impact</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                {metrics.slice(0, 4).map((m) => (
                  <div key={m.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs text-ink-3">{m.label}</dt>
                    <dd className="text-4xl font-bold tracking-[-0.03em] text-ink">
                      <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                    </dd>
                  </div>
                ))}
              </dl>
              <SignalTrace className="mt-auto" />
              {/* Floating badge. The brief proposes "100+ Hospitals": swap in once Flokefama confirms the figure. */}
              <span className="absolute bottom-[104px] right-6 inline-flex items-center gap-2 rounded-full border border-line bg-paper/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
                <span className="status-dot" aria-hidden /> Ghana Club 100
              </span>
            </article>
          </Reveal>

          {/* Card_02_Featured */}
          <Reveal delay={0.08} className="lg:col-span-4">
            <Link
              href="/products/mindray-bs-240"
              className="group relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-3xl border border-midnight bg-midnight p-7 text-white"
            >
              <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.35),transparent_65%)]" />
              <p className="label relative !text-neon-300">Featured system</p>
              <h3 className="relative mt-3 text-3xl font-bold tracking-[-0.03em] text-white">Mindray BS-240</h3>
              <p className="relative mt-2 max-w-[18rem] text-sm text-white/60">Fully automated bench-top clinical chemistry, installed and serviced nationwide.</p>
              <div className="relative mt-auto h-56">
                <Image
                  src="/images/solution-ivd.webp"
                  alt="Mindray BS-240 chemistry analyser"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-contain object-right-bottom mix-blend-lighten transition-transform duration-1000 ease-out-expo group-hover:scale-105"
                />
              </div>
              <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium text-neon-300">
                Open deep spec sheet <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>

          {/* Card_03_Media */}
          <Reveal delay={0.16} className="lg:col-span-4">
            <article className="flex h-full min-h-[440px] flex-col rounded-3xl border border-line bg-paper p-7">
              <p className="label">Media · June/July 2026</p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Forbes Africa feature</h3>
              <p className="mt-2 text-sm text-ink-3">“Ghana: Africa Undiscovered” edition, in collaboration with Penresa.</p>
              <MediaThumbnail
                image="/images/forbes-africa-2026.webp"
                alt="Forbes Africa, Ghana 2026: Africa Undiscovered edition cover"
                href="/#media"
                cta="Read the feature"
                className="mt-6 flex-1"
              />
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Video_Thumbnail_Player (radius 16px). Shows a play control when `video` is supplied;
 * until Flokefama provides footage it presents the cover with a read action.
 */
function MediaThumbnail({ image, alt, href, cta, video, className }: { image: string; alt: string; href: string; cta: string; video?: string; className?: string }) {
  return (
    <Link href={video ?? href} className={`group relative block min-h-[200px] overflow-hidden rounded-2xl bg-midnight ${className ?? ''}`}>
      <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover object-top transition-transform duration-1000 ease-out-expo group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent" />
      <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur transition group-hover:bg-white">
        <Icon name={video ? 'fi-rr-play' : 'fi-rr-book-alt'} /> {video ? 'Play feature' : cta}
      </span>
    </Link>
  );
}

/** Decorative clinical signal trace (not a data chart: no values are implied). */
function SignalTrace({ className }: { className?: string }) {
  const d = 'M0 60 H70 L82 60 L90 38 L98 82 L106 20 L114 70 L122 60 H190 L202 60 L210 44 L218 74 L226 30 L234 64 L242 60 H320';
  return (
    <svg viewBox="0 0 320 100" className={`w-full ${className ?? ''}`} aria-hidden>
      <defs>
        <linearGradient id="trace" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#e2e6ea" strokeDasharray="2 4" />)}
      <path d={d} fill="none" stroke="url(#trace)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="320" cy="60" r="4" fill="#10b981" />
    </svg>
  );
}
