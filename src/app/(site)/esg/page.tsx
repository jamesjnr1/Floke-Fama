import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';

export const metadata: Metadata = {
  title: 'ESG: Environmental, Social & Governance',
  description: 'Patient safety, community, education, local industry and governance: how Flokefama creates value beyond supply.',
  alternates: { canonical: '/esg' },
};


export default async function EsgPage() {
  const { purpose, esgPillars: pillars } = await getSite();
  const aim = purpose.find((p) => p.label === 'Aim') ?? purpose[purpose.length - 1];
  return (
    <>
      <SitePageHero page="esg" />

      <section className="bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <ul className="swipe-row gap-4 md:grid-cols-2">
            {pillars.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.06} className="flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-canvas">
                  <div className="relative aspect-[16/10] bg-mist">
                    <Image src={p.image} alt={p.alt} fill sizes="(min-width: 768px) 600px, 84vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 md:p-9">
                    <p className="label flex items-center gap-2"><Icon name={p.icon} className="text-brand-600" /> {p.label}</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">{p.title}</h2>
                    <p className="mt-3 leading-relaxed text-ink-3">{p.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-6 flex flex-col gap-3 rounded-4xl border border-line bg-canvas p-7 md:flex-row md:items-center md:justify-between md:p-9">
            <div>
              <p className="label flex items-center gap-2"><Icon name={aim.icon} className="text-brand-600" /> Economic · Local industry</p>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">{aim.text}</p>
            </div>
            <Link href="/about#mission" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
              Our mission &amp; vision
            </Link>
          </Reveal>
        </div>
      </section>

    </>
  );
}
