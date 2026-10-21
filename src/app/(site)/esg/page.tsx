import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { csrCommitments, csrProjects, forbes, kpone, type CsrGroup, type CsrPhoto } from '@/data/csr';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description: 'How Flokefama gives back: support for healthcare institutions, professional development and communities across Ghana.',
  alternates: { canonical: '/esg' },
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

/** Pentecost: the project as two numbered phases, construction then the finished unit. */
function Phases({ p }: { p: Project }) {
  return (
    <>
      <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Head p={p} className="lg:col-span-7" />
        <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">{p.text}</p>
      </Reveal>
      <ol className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-10">
        {p.groups.map((g, i) => (
          <li key={g.caption}>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-extrabold leading-none tracking-[-0.04em] text-brand-600 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-ink-2">{g.caption}</span>
              {i === 0 && <Icon name="fi-rr-arrow-small-right" className="ml-auto hidden text-3xl text-brand-600 lg:inline-flex" />}
            </div>
            <div className={cn('mt-5 grid gap-3', g.photos.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
              {g.photos.map((ph) => <Shot key={ph.src} p={ph} sizes="(min-width: 1024px) 300px, 50vw" className={g.photos.length === 3 ? 'aspect-[5/6]' : 'aspect-[4/3]'} />)}
            </div>
            {g.title && <h3 className="mt-5 text-xl font-bold tracking-[-0.01em] text-ink">{g.title}</h3>}
            <Points points={g.points} />
          </li>
        ))}
      </ol>
    </>
  );
}

/** Korle Bu: one large photo with the story over it, the second photo set into the corner. */
function Feature({ p }: { p: Project }) {
  const [main, second] = p.groups;
  return (
    <>
      <Reveal><Head p={p} /></Reveal>
      <figure className="relative mt-10">
        <Shot p={main.photos[0]} sizes="(min-width: 1280px) 1200px, 100vw" className="aspect-[4/3] md:aspect-[21/9]" />
        <div aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(10_16_20/0.82)_0%,rgb(10_16_20/0.5)_45%,transparent_75%)] md:block" />
        <figcaption className="mt-5 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:max-w-xl md:p-10">
          <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700 md:text-brand-300">{main.caption}</p>
          <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3 md:text-white">{main.text}</p>
        </figcaption>
      </figure>
      <figure className="mt-8 grid items-center gap-6 border border-line bg-paper p-4 md:mt-4 md:ml-auto md:w-[60%] md:-translate-y-20 md:grid-cols-[1fr_1.1fr] md:p-5 md:shadow-[0_24px_48px_-24px_rgb(10_16_20/0.35)]">
        <Shot p={second.photos[0]} sizes="(min-width: 768px) 360px, 100vw" className="aspect-[4/3]" />
        <figcaption>
          <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{second.caption}</p>
          <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{second.text}</p>
        </figcaption>
      </figure>
    </>
  );
}

/** UGMC: on the dark band, a large photo beside the story, the handover photo under the text. */
function DarkSplit({ p }: { p: Project }) {
  const [main, second] = p.groups;
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
      <Reveal className="lg:col-span-7">
        <Shot p={main.photos[0]} sizes="(min-width: 1024px) 700px, 100vw" className="aspect-[4/3]" />
      </Reveal>
      <Reveal delay={0.06} className="lg:col-span-5">
        <Head p={p} light />
        <p className="mt-6 text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-300">{main.caption}</p>
        <p className="no-justify mt-1.5 text-lg leading-relaxed text-white/80">{main.text}</p>
        <div className="mt-8 grid grid-cols-[120px_1fr] items-center gap-5 sm:grid-cols-[160px_1fr]">
          <Shot p={second.photos[0]} sizes="160px" className="aspect-square" />
          <div>
            <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-300">{second.caption}</p>
            <p className="no-justify mt-1.5 text-[1.0625rem] leading-relaxed text-white/80">{second.text}</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** The Trust Hospital: the story on the left, the two photos overlapping on the right. */
function Overlap({ p }: { p: Project }) {
  const [a, b] = p.groups;
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
      <Reveal className="lg:col-span-5">
        <Head p={p} />
        {[a, b].map((g) => (
          <div key={g.caption} className="mt-7">
            <h3 className="text-xl font-bold tracking-[-0.01em] text-ink">{g.caption}</h3>
            <p className="no-justify mt-1.5 text-lg leading-relaxed text-ink-3">{g.text}</p>
          </div>
        ))}
      </Reveal>
      <Reveal delay={0.06} className="relative lg:col-span-7 lg:pb-24">
        <Shot p={a.photos[0]} sizes="(min-width: 1024px) 560px, 100vw" className="aspect-[4/3] lg:w-[78%]" />
        <Shot p={b.photos[0]} sizes="(min-width: 1024px) 380px, 100vw" className="mt-4 aspect-[4/3] border-[6px] border-paper lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:w-[52%] lg:shadow-[0_24px_48px_-24px_rgb(10_16_20/0.4)]" />
      </Reveal>
    </div>
  );
}

/** Women in engineering: a photo mosaic, each part captioned under its photo. */
function Mosaic({ p }: { p: Project }) {
  const [news, female, team] = p.groups;
  const Cap = ({ g }: { g: CsrGroup }) => (
    <figcaption className="mt-4">
      <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.06em] text-brand-700">{g.caption}</p>
      <p className="no-justify mt-1.5 text-[1.0625rem] leading-relaxed text-ink-3">{g.text}</p>
    </figcaption>
  );
  return (
    <>
      <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Head p={p} className="lg:col-span-8" />
        <div className="lg:col-span-4 lg:text-right"><Story href={p.href} /></div>
      </Reveal>
      <div className="mt-10 grid gap-8 md:grid-cols-12 md:gap-6">
        <figure className="md:col-span-5">
          <Shot p={news.photos[0]} sizes="(min-width: 768px) 500px, 100vw" className="aspect-[6/5]" />
          <Cap g={news} />
        </figure>
        <figure className="md:col-span-7">
          <Shot p={female.photos[0]} sizes="(min-width: 768px) 700px, 100vw" className="aspect-[7/4]" />
          <Cap g={female} />
        </figure>
        {/* The two wide team photos side by side across the full width */}
        <figure className="md:col-span-12">
          <div className="grid gap-3 sm:grid-cols-2">
            {team.photos.map((ph) => <Shot key={ph.src} p={ph} sizes="(min-width: 768px) 620px, 100vw" className="aspect-[5/2]" />)}
          </div>
          <Cap g={team} />
        </figure>
      </div>
    </>
  );
}

export default async function EsgPage() {
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

      {/* Recognition by Forbes Africa */}
      <section aria-labelledby="forbes" className="bg-midnight text-white section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="max-w-4xl">
            <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-300">{forbes.label}</p>
            <h2 id="forbes" className="mt-3 text-[clamp(1.875rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.03em] text-white">{forbes.title}</h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {forbes.points.map((p) => (
              <li key={p.title} className="bg-white/[0.06] p-7">
                <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                <p className="no-justify mt-2 text-lg leading-relaxed text-white/75">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kpone Hospital: before and after */}
      <section aria-labelledby="kpone" className="pattern-dots pattern-bl border-t border-line bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Facility renovation</p>
              <h2 id="kpone" className="display mt-2 text-[clamp(2rem,1.2rem+2.4vw,3rem)]">{kpone.title}</h2>
            </div>
            <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">{kpone.text}</p>
          </Reveal>
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="inline-block bg-signal-700 px-3 py-1.5 text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-white">Before</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {kpone.before.map((p) => <Shot key={p.src} p={p} sizes="(min-width: 1024px) 300px, 50vw" className="aspect-[7/6]" />)}
              </div>
            </div>
            <div>
              <p className="inline-block bg-brand-600 px-3 py-1.5 text-[0.9375rem] font-bold uppercase tracking-[0.06em] text-white">After</p>
              <div className="mt-4 grid grid-cols-6 gap-3">
                {kpone.after.slice(0, 3).map((p) => <Shot key={p.src} p={p} sizes="(min-width: 1024px) 200px, 33vw" className="col-span-2 aspect-[4/3]" />)}
                {kpone.after.slice(3, 5).map((p) => <Shot key={p.src} p={p} sizes="(min-width: 1024px) 300px, 50vw" className="col-span-3 aspect-[16/9]" />)}
                {kpone.after.slice(5).map((p) => <Shot key={p.src} p={p} sizes="(min-width: 1024px) 620px, 100vw" className="col-span-6 aspect-[15/4]" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The other projects, each laid out in its own way */}
      <section aria-label={byId('pentecost').title} className="pattern-grid pattern-tr border-t border-line bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10"><Phases p={byId('pentecost')} /></div>
      </section>
      <section aria-label={byId('korle-bu').title} className="pattern-dots pattern-br border-t border-line bg-paper pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 md:px-10 md:pb-4"><Feature p={byId('korle-bu')} /></div>
      </section>
      <section aria-label={byId('ugmc').title} className="bg-midnight text-white section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10"><DarkSplit p={byId('ugmc')} /></div>
      </section>
      <section aria-label={byId('trust-hospital').title} className="pattern-cross bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10"><Overlap p={byId('trust-hospital')} /></div>
      </section>
      <section aria-label={byId('engineering').title} className="pattern-dots pattern-br border-t border-line bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10"><Mosaic p={byId('engineering')} /></div>
      </section>
    </>
  );
}
