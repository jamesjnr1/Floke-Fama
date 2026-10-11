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

/** One CSR activity as a row: date, title, a short description and the story link; its photo beside it when there is one. */
function Activity({ a }: { a: CsrActivity }) {
  return (
    <li className="grid gap-5 border-b border-line py-7 last:border-b-0 sm:grid-cols-[1fr_auto] sm:gap-8">
      <div>
        {a.date && <p className="text-[0.9375rem] text-ink-3">{a.date}</p>}
        <h4 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.01em] text-ink">{a.title}</h4>
        <p className="no-justify mt-2 text-lg leading-relaxed text-ink-3">{a.text}</p>
        {a.href && (
          <Link href={a.href} className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
            Read the story <Icon name="fi-rr-arrow-small-right" />
          </Link>
        )}
      </div>
      {a.image && (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-mist sm:w-64">
          <Image src={a.image} alt={a.alt ?? ''} fill sizes="(min-width: 640px) 256px, 100vw" className="object-cover" />
        </div>
      )}
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

  return (
    <>
      <SitePageHero page="esg" />

      {/* Corporate social responsibility, grouped as in the CEO's review */}
      <section className="bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="max-w-2xl">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)]">Corporate Social Responsibility</h2>
            <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">Our work does not end with supplying equipment. We give back to the institutions, professionals and communities that make healthcare in Ghana possible.</p>
          </Reveal>

          <div className="mt-12 border-t border-line">
            {csrGroups.map((g) => (
              <div key={g.title} className="grid gap-2 border-b border-line py-8 lg:grid-cols-12 lg:gap-10 lg:py-10">
                <div className="lg:col-span-4 lg:pt-7">
                  <h3 className="text-2xl font-bold tracking-[-0.02em] text-ink">{g.title}</h3>
                  <p className="no-justify mt-1.5 text-lg text-ink-3">{g.intro}</p>
                </div>
                <ul className="lg:col-span-8">
                  {g.items.map((a) => <Activity key={a.title} a={a} />)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESG commitments */}
      <section className="border-t border-line bg-paper section-y">
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
