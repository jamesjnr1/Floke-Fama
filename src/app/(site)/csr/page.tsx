import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { CsrAreaNav } from '@/components/csr/area-nav';
import { KponeGallery } from '@/components/csr/kpone-gallery';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { csrCommitments, csrProjects, forbes, kpone, type CsrPhoto } from '@/data/csr';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description: 'How Flokefama gives back: support for healthcare institutions, professional development and communities across Ghana.',
  alternates: { canonical: '/csr' },
};

/** A project photo, kept whole in its frame. */
function Shot({ p, sizes, className }: { p: CsrPhoto; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-mist ${className ?? 'aspect-[16/10]'}`}>
      <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

type Project = (typeof csrProjects)[number];
const byId = (id: string) => csrProjects.find((p) => p.id === id)!;

/** The label and title every project starts with; `light` on dark backgrounds. */
function Head({ p, light, className }: { p: Project; light?: boolean; className?: string }) {
  return (
    <div className={className}>
      <p className={cn('text-[0.9375rem] font-semibold uppercase tracking-[0.08em]', light ? 'text-brand-300' : 'text-brand-700')}>{p.label}</p>
      <h2 className={cn('display mt-2 text-[clamp(2rem,1.2rem+2.4vw,3rem)]', light && 'text-white')}>{p.title}</h2>
    </div>
  );
}

function Story({ href, light }: { href?: string; light?: boolean }) {
  if (!href) return null;
  return (
    <Link href={href} className={cn('mt-8 inline-flex items-center gap-1.5 text-lg font-semibold', light ? 'text-brand-300 hover:text-white' : 'text-brand-700 hover:text-brand-800')}>
      Read the story <Icon name="fi-rr-arrow-small-right" />
    </Link>
  );
}

const Points = ({ points }: { points?: string[] }) =>
  points ? (
    <ul className="mt-4 space-y-2">
      {points.map((t) => (
        <li key={t} className="flex gap-3 text-lg leading-relaxed text-ink-3">
          <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 bg-brand-600" />
          {t}
        </li>
      ))}
    </ul>
  ) : null;

/**
 * A large photo with the story over it and the next part in a card overlapping its corner (Korle Bu). `flip` puts the
 * story and the card on the other side (UGMC); extra parts follow as cards in a row under the card (women in engineering).
 * The Trust Hospital uses it too.
 */
function Feature({ p, flip }: { p: Project; flip?: boolean }) {
  const [main, second, ...rest] = p.groups;
  const veil = flip
    ? 'bg-[linear-gradient(270deg,rgb(10_16_20/0.82)_0%,rgb(10_16_20/0.5)_45%,transparent_75%)]'
    : 'bg-[linear-gradient(90deg,rgb(10_16_20/0.82)_0%,rgb(10_16_20/0.5)_45%,transparent_75%)]';
  return (
    <>
      <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Head p={p} className="lg:col-span-7" />
        <div className="lg:col-span-5">
          {p.text && <p className="no-justify text-lg leading-relaxed text-ink-3">{p.text}</p>}
          <Story href={p.href} />
        </div>
      </Reveal>
      <figure className="relative mt-10">
        <Shot p={main.photos[0]} sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[4/3] md:aspect-[21/9]" />
        <div aria-hidden className={cn('absolute inset-0 hidden md:block', veil)} />
        <figcaption className={cn('mt-5 md:absolute md:bottom-0 md:mt-0 md:max-w-xl md:p-10', flip ? 'md:right-0 md:text-right' : 'md:left-0', rest.length > 0 && 'md:pb-28')}>
          <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700 md:text-brand-300">{main.caption}</p>
          <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3 md:text-white">{main.text}</p>
        </figcaption>
      </figure>
      {second && (
        // The next parts as cards overlapping the photo's lower edge: one card on the far side, or a row of cards
        <div className={cn('mt-8 grid gap-6 md:mt-4 md:-translate-y-20', rest.length ? 'md:grid-cols-2' : cn('md:w-[60%]', flip ? 'md:mr-auto' : 'md:ml-auto'))}>
          {[...rest, second].map((g) => (
            // A part without photos (Industry collaboration) is a text card
            <figure key={g.caption} className={cn('grid items-center gap-5 border border-line bg-paper p-4 md:p-5 md:shadow-[0_24px_48px_-24px_rgb(10_16_20/0.35)]', g.photos.length ? 'md:grid-cols-[1fr_1.1fr]' : 'md:px-8')}>
              {g.photos.length > 0 && (
                <div className={cn('grid gap-2', g.photos.length > 1 && 'grid-cols-2')}>
                  {g.photos.map((ph) => <Shot key={ph.src} p={ph} sizes="(min-width: 768px) 360px, 100vw" className={g.photos.length > 1 ? 'aspect-square' : 'aspect-[4/3]'} />)}
                </div>
              )}
              <figcaption>
                <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{g.caption}</p>
                <p className="no-justify mt-2 text-[1.0625rem] leading-relaxed text-ink-3">{g.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

/** Pentecost: like Kpone's before and after, the construction phase beside the finished unit. */
function Phases({ p }: { p: Project }) {
  const tone = ['bg-[#a86b00]', 'bg-brand-600'];
  return (
    <>
      <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Head p={p} className="lg:col-span-7" />
        <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">{p.text}</p>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {p.groups.map((g, i) => (
          <div key={g.caption}>
            <p className={cn('inline-block px-3 py-1.5 text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-white', tone[i % 2])}>{g.caption}</p>
            <div className={cn('mt-4 grid gap-3', g.photos.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
              {g.photos.map((ph) => <Shot key={ph.src} p={ph} sizes="(min-width: 1024px) 300px, 50vw" className={g.photos.length === 3 ? 'aspect-[5/6]' : 'aspect-[4/3]'} />)}
            </div>
            {g.title && <h3 className="mt-5 text-xl font-bold tracking-[-0.01em] text-ink">{g.title}</h3>}
            <Points points={g.points} />
          </div>
        ))}
      </div>
    </>
  );
}

/** The three areas the CSR projects are grouped in, in page order, each with a photo for its card. */
const areas = [
  { id: 'building-innovation', n: '01', title: 'Building innovation', lead: 'Renovating and building hospital facilities: laboratories, sterile services and blood banks.', projects: ['Kpone Hospital', 'Pentecost Hospital', 'Korle Bu Teaching Hospital'], image: '/images/csr/kpone-1.webp', position: '50% 55%' },
  { id: 'equipment-donation', n: '02', title: 'Equipment donation', lead: 'Medical equipment donated to hospitals, from neonatal incubators to specialised equipment.', projects: ['University of Ghana Medical Centre', 'The Trust Hospital'], image: '/images/csr/ugmc-incubator-donation.webp' },
  { id: 'news-and-other-areas', n: '03', title: 'News & other areas', lead: 'Recognition for our work, and programmes beyond the hospital walls.', projects: ['Forbes Africa', 'Women in engineering'], image: '/images/forbes-africa-2026.webp', position: '50% 30%' },
];
type Area = (typeof areas)[number];

/** The band that opens an area: its number, name and what it covers. */
function AreaHead({ area }: { area: Area }) {
  return (
    <section id={area.id} aria-labelledby={`${area.id}-title`} className="scroll-mt-[calc(var(--banner)+4.5rem)] bg-brand-700 py-12 text-white md:py-16">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 md:flex-row md:items-end md:justify-between md:gap-10 md:px-10">
        <div>
          <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-white/70">{area.n} · Our CSR</p>
          <h2 id={`${area.id}-title`} className="display mt-2 text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] text-white">{area.title}</h2>
        </div>
        <p className="no-justify max-w-md text-lg leading-relaxed text-white/80">{area.lead}</p>
      </div>
    </section>
  );
}

export default async function EsgPage() {
  // Kpone Hospital: the built-in photos, then the photos and video added in the Studio
  const studio = (await getSite()).kpone;
  const kponePhotos: CsrPhoto[] = [...kpone.photos, ...studio.photos];
  const kponeVideo = studio.video;
  return (
    <>
      <SitePageHero page="esg" kicker="Corporate Social Responsibility" />

      {/* Our commitment: the three parts of Flokefama's CSR */}
      <section className="pattern-cross pattern-tr bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)] lg:col-span-7">Giving back to the people behind Ghana’s healthcare</h2>
            <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">Our work does not end with supplying equipment. We invest in hospitals, in the next generation of professionals and in communities.</p>
          </Reveal>
          <ul className="mt-12 grid gap-px border border-line bg-line md:grid-cols-3">
            {csrCommitments.map((c) => (
              <li key={c.label} className="bg-paper p-7 lg:p-9">
                <Icon name={c.icon} className="text-3xl text-brand-600" />
                <p className="mt-5 text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{c.label}</p>
                <h3 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-ink">{c.title}</h3>
                <p className="no-justify mt-3 text-lg leading-relaxed text-ink-3">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The three areas of our CSR (the IT team's review, Nov 2026), each a heading band with its projects under it */}
      <CsrAreaNav areas={areas} />

      <AreaHead area={areas[0]} />
      {/* Kpone Hospital: the renovated laboratory (a video first when there is one, then a large photo and rows of three) */}
      <section aria-labelledby="kpone" className="pattern-dots pattern-bl border-t border-line bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Facility renovation</p>
              <h2 id="kpone" className="display mt-2 text-[clamp(2rem,1.2rem+2.4vw,3rem)]">{kpone.title}</h2>
            </div>
            <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">{kpone.text}</p>
          </Reveal>
          <div className="mt-10">
            <KponeGallery photos={kponePhotos} video={kponeVideo} title={kpone.title} />
          </div>
        </div>
      </section>

      <section aria-label={byId('pentecost').title} className="pattern-grid pattern-tr border-t border-line bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10"><Phases p={byId('pentecost')} /></div>
      </section>
      <section aria-label={byId('korle-bu').title} className="pattern-dots pattern-br border-t border-line bg-paper pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-4"><Feature p={byId('korle-bu')} /></div>
      </section>

      <AreaHead area={areas[1]} />
      <section aria-label={byId('ugmc').title} className="pattern-grid pattern-tr border-t border-line bg-canvas pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-4"><Feature p={byId('ugmc')} flip /></div>
      </section>
      <section aria-label={byId('trust-hospital').title} className="pattern-dots pattern-br border-t border-line bg-paper pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-4"><Feature p={byId('trust-hospital')} /></div>
      </section>

      <AreaHead area={areas[2]} />
      {/* Recognition by Forbes Africa */}
      <section aria-labelledby="forbes" className="bg-midnight text-white section-y">
        {/* The heading across the top; under it the Forbes Africa Ghana 2026 cover on the left and the three points on the
            right, running from the top of the cover to its foot */}
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="max-w-4xl">
            <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-300">{forbes.label}</p>
            <h2 id="forbes" className="mt-3 text-[clamp(1.875rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.03em] text-white">{forbes.title}</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
            <Reveal>
              <div className="relative mx-auto aspect-[978/1276] w-full max-w-md shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] lg:max-w-none">
                <Image src="/images/forbes-africa-2026.webp" alt="Forbes Africa, Ghana 2026: Africa Undiscovered edition cover" fill sizes="(min-width: 1024px) 460px, 90vw" className="object-cover" />
              </div>
            </Reveal>
            {/* On large screens the cover sets the row's height and the three points share it exactly */}
            <div className="relative">
            <ul className="grid gap-4 lg:absolute lg:inset-0 lg:grid-rows-3">
              {forbes.points.map((p) => (
                <li key={p.title} className="flex flex-col justify-center bg-white/[0.06] p-6 md:px-8">
                  <h3 className="text-xl font-semibold text-white md:text-2xl">{p.title}</h3>
                  <p className="no-justify mt-2 text-lg leading-relaxed text-white/75">{p.text}</p>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={byId('engineering').title} className="pattern-dots pattern-br border-t border-line bg-canvas pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-4"><Feature p={byId('engineering')} /></div>
      </section>
    </>
  );
}
