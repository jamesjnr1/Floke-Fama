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

/** One CSR activity: its photo (or an icon panel until photographs arrive), title, date and a short description. */
function Activity({ a }: { a: CsrActivity }) {
  const body = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-brand-50">
        {a.image ? (
          <Image src={a.image} alt={a.alt ?? ''} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-5xl text-brand-600" aria-hidden>
            <Icon name={a.icon} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {a.date && <p className="text-sm text-ink-3">{a.date}</p>}
        <h3 className="mt-1 text-lg font-semibold leading-snug text-ink">{a.title}</h3>
        <p className="no-justify mt-2 leading-relaxed text-ink-3">{a.text}</p>
        {a.href && <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-700 group-hover:underline">Read the story <Icon name="fi-rr-arrow-small-right" /></span>}
      </div>
    </>
  );
  const card = 'group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper';
  return a.href ? <Link href={a.href} className={`${card} transition hover:border-ink/20`}>{body}</Link> : <div className={card}>{body}</div>;
}

export default async function EsgPage() {
  const { purpose, esgPillars } = await getSite();
  const aim = purpose.find((p) => p.label === 'Aim') ?? purpose[purpose.length - 1];
  // ESG commitments beyond CSR: patient safety and governance (editable in the Studio), and local industry (our Aim)
  const esg = [
    ...esgPillars.filter((p) => /patient safety|governance/i.test(p.label)).map((p) => ({ icon: p.icon, label: p.label, title: p.title, text: p.body })),
    { icon: aim.icon, label: 'Economic · Local industry', title: 'Making it in Ghana.', text: aim.text },
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

          <div className="mt-12 divide-y divide-line border-y border-line">
            {csrGroups.map((g) => (
              <div key={g.title} className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                  <h3 className="text-xl font-bold tracking-[-0.01em] text-ink">{g.title}</h3>
                  <p className="mt-1 text-ink-3">{g.intro}</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
                  {g.items.map((a) => (
                    <li key={a.title}><Activity a={a} /></li>
                  ))}
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
              <li key={e.label} className="rounded-lg border border-line bg-canvas p-6">
                <p className="flex items-center gap-2 text-sm font-medium text-brand-700"><Icon name={e.icon} /> {e.label}</p>
                <h3 className="mt-3 text-lg font-semibold text-ink">{e.title}</h3>
                <p className="no-justify mt-2 leading-relaxed text-ink-3">{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
