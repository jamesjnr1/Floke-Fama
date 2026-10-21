import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { csrCommitments, csrProjects, forbes, kpone, type CsrGroup, type CsrPhoto } from '@/data/csr';

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

/** Photo columns for a part of a project: one wide photo, or two or three side by side. */
const cols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' } as const;
const shape = { 1: 'aspect-[16/10]', 2: 'aspect-[16/10]', 3: 'aspect-[5/6]' } as const;

function Group({ g, wide }: { g: CsrGroup; wide: boolean }) {
  const n = Math.min(g.photos.length, 3) as 1 | 2 | 3;
  return (
    <figure>
      {/* In a narrow column two photos stack, together as tall as a single photo */}
      <div className={`grid gap-3 ${!wide && n === 2 ? 'grid-cols-1' : cols[n]}`}>
        {g.photos.map((p) => <Shot key={p.src} p={p} sizes={wide ? '(min-width: 768px) 620px, 100vw' : '(min-width: 1024px) 400px, 100vw'} className={!wide && n === 2 ? 'aspect-[16/4.85]' : shape[n]} />)}
      </div>
      <figcaption className="mt-5">
        <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.06em] text-brand-700">{g.caption}</p>
        {g.title && <h3 className="mt-1.5 text-xl font-bold tracking-[-0.01em] text-ink">{g.title}</h3>}
        {g.text && <p className="no-justify mt-1.5 text-lg leading-relaxed text-ink-3">{g.text}</p>}
        {g.points && (
          <ul className="mt-3 space-y-2">
            {g.points.map((t) => (
              <li key={t} className="flex gap-3 text-lg leading-relaxed text-ink-3">
                <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 bg-brand-600" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </figcaption>
    </figure>
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
      <section aria-labelledby="kpone" className="border-t border-line bg-paper section-y">
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

      {/* The other projects: Pentecost CSSD, Korle Bu, UGMC, The Trust Hospital, ZoDF, women in engineering */}
      {csrProjects.map((proj, i) => (
        <section key={proj.title} aria-label={proj.title} className={`border-t border-line section-y ${i % 2 ? 'bg-paper' : 'bg-canvas'}`}>
          <div className="mx-auto max-w-[1280px] px-5 md:px-10">
            <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className="lg:col-span-7">
                <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{proj.label}</p>
                <h2 className="display mt-2 text-[clamp(2rem,1.2rem+2.4vw,3rem)]">{proj.title}</h2>
              </div>
              {proj.text && <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">{proj.text}</p>}
            </Reveal>
            <div className={`mt-10 grid gap-10 md:gap-8 ${proj.groups.length === 3 ? 'md:grid-cols-3' : proj.groups.length === 2 ? 'md:grid-cols-2' : proj.stat ? 'md:grid-cols-[1.4fr_1fr] md:items-start' : ''}`}>
              {proj.groups.map((g) => <Group key={g.caption} g={g} wide={proj.groups.length < 3} />)}
              {proj.stat && (
                <div className="border border-line bg-paper p-7 lg:p-9">
                  <p className="text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-extrabold tracking-[-0.03em] text-brand-700">{proj.stat.value}</p>
                  <p className="mt-2 text-lg text-ink-3">{proj.stat.label}</p>
                </div>
              )}
            </div>
            {proj.href && (
              <Link href={proj.href} className="mt-8 inline-flex items-center gap-1.5 text-lg font-semibold text-brand-700 hover:text-brand-800">
                Read the story <Icon name="fi-rr-arrow-small-right" />
              </Link>
            )}
          </div>
        </section>
      ))}

    </>
  );
}
