import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { csrCommitments, csrGroups, csrProjects, kpone, type CsrActivity, type CsrPhoto } from '@/data/csr';
import { getSite } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Corporate Social Responsibility',
  description: 'How Flokefama gives back: support for healthcare institutions, professional development and communities across Ghana, alongside our ESG commitments.',
  alternates: { canonical: '/esg' },
};

type Item = CsrActivity & { group: string };

/** The activity's photo, or a placeholder until the photograph arrives (requested from the CEO). */
function Photo({ a, sizes }: { a: Item; sizes: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-mist">
      {a.image ? (
        <Image src={a.image} alt={a.alt ?? ''} fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(135deg,transparent_0,transparent_14px,rgb(22_35_42/0.035)_14px,rgb(22_35_42/0.035)_15px)] text-ink-3">
          <span className="flex flex-col items-center gap-2 text-[0.9375rem]">
            <Icon name="fi-rr-camera" className="text-2xl" />
            Photo coming soon
          </span>
        </div>
      )}
    </div>
  );
}

/** A project photo, kept whole in its frame. */
function Shot({ p, sizes, className }: { p: CsrPhoto; sizes: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-mist ${className ?? 'aspect-[16/10]'}`}>
      <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

/** Date or area above the title. */
const Meta = ({ a }: { a: Item }) => <p className="text-[0.9375rem] font-semibold text-brand-700">{a.group}{a.date && ` · ${a.date}`}</p>;

/** The activities with a published story, as large stories. */
function Story({ a }: { a: Item }) {
  const body = (
    <>
      <Photo a={a} sizes="(min-width: 768px) 620px, 100vw" />
      <div className="mt-5"><Meta a={a} /></div>
      <h3 className="mt-1.5 text-2xl font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-brand-700">{a.title}</h3>
      <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{a.text}</p>
      {a.href && <span className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700">Read the story <Icon name="fi-rr-arrow-small-right" /></span>}
    </>
  );
  return a.href ? <Link href={a.href} className="group block">{body}</Link> : <div>{body}</div>;
}

/** The other activities, smaller, with their photo or a placeholder. */
function Card({ a }: { a: Item }) {
  return (
    <li className="flex flex-col">
      <Photo a={a} sizes="(min-width: 768px) 400px, 100vw" />
      <div className="mt-5"><Meta a={a} /></div>
      <h3 className="mt-1.5 text-xl font-bold leading-snug tracking-[-0.01em] text-ink">{a.title}</h3>
      <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{a.text}</p>
    </li>
  );
}

export default async function EsgPage() {
  const { purpose, esgPillars } = await getSite();
  const aim = purpose.find((p) => p.label === 'Aim') ?? purpose[purpose.length - 1];
  // ESG commitments beyond CSR: patient safety and governance (editable in the Studio), and local industry (our Aim)
  const esg = [
    ...esgPillars.filter((p) => /patient safety|governance/i.test(p.label)).map((p) => ({ label: p.label, title: p.title, text: p.body })),
    { label: 'Economic · Local industry', title: 'Making it in Ghana.', text: aim.text },
  ];

  const all: Item[] = csrGroups.flatMap((g) => g.items.map((a) => ({ ...a, group: g.title })));
  const stories = all.filter((a) => a.href);
  const others = all.filter((a) => !a.href);

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

      {/* Korle Bu blood bank and the UGMC donation */}
      {csrProjects.map((proj, i) => (
        <section key={proj.title} aria-label={proj.title} className={`border-t border-line section-y ${i % 2 ? 'bg-paper' : 'bg-canvas'}`}>
          <div className="mx-auto max-w-[1280px] px-5 md:px-10">
            <Reveal>
              <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">{proj.label}</p>
              <h2 className="display mt-2 text-[clamp(2rem,1.2rem+2.4vw,3rem)]">{proj.title}</h2>
            </Reveal>
            <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8">
              {proj.photos.map((p) => (
                <figure key={p.src}>
                  <Shot p={p} sizes="(min-width: 768px) 620px, 100vw" />
                  <figcaption className="mt-5">
                    <p className="text-[0.9375rem] font-semibold text-brand-700">{p.caption}</p>
                    <p className="no-justify mt-1.5 text-lg leading-relaxed text-ink-3">{p.text}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* More of our work: published stories first, then the other activities */}
      <section className="pattern-cross pattern-tr border-t border-line bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">More of our work</h2>

          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-6">
            {stories.map((a) => <Story key={a.title} a={a} />)}
          </div>

          <ul className="mt-14 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {others.map((a) => <Card key={a.title} a={a} />)}
          </ul>
        </div>
      </section>

      {/* ESG commitments */}
      <section className="pattern-dots pattern-bl border-t border-line bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Our ESG commitments</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {esg.map((e) => (
              <li key={e.label} className="rounded-lg border border-line bg-canvas p-7">
                <p className="text-[0.9375rem] font-semibold text-brand-700">{e.label}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-ink">{e.title}</h3>
                <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
