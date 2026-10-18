import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { csrGroups, type CsrActivity } from '@/data/csr';
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
      <SitePageHero page="esg" />

      {/* Corporate social responsibility (the CEO's review, point 4): published stories first, then the other activities */}
      <section className="pattern-cross pattern-tr bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)] lg:col-span-7">Giving back to the people behind Ghana’s healthcare</h2>
            <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">Our work does not end with supplying equipment. We invest in hospitals, in the next generation of professionals and in communities.</p>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-6">
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
