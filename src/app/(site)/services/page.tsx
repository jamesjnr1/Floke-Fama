import type { Metadata } from 'next';
import Image from 'next/image';
import { Services } from '@/components/home/services';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { CatalogueGrid } from '@/components/products/catalogue-grid';
import { DepartmentSolutions } from '@/components/products/department-solutions';
import { Reveal } from '@/components/motion/reveal';
import { Globe, Headset, Link2, MapPin } from 'lucide-react';
import { ToneIcon } from '@/components/ui/tone-icon';
import { getSite } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Products & Services',
  description: 'Medical equipment sales, installation, maintenance, calibration, repairs and training, from the official distributor of Mindray.',
  alternates: { canonical: '/services' },
};

const why = [
  { icon: Link2, tone: 'green' },
  { icon: Globe, tone: 'blue' },
  { icon: Headset, tone: 'red' },
  { icon: MapPin, tone: 'amber' },
] as const;

/** Shows the Mindray logo where the text names Mindray. */
function withMindrayLogo(text: string) {
  const at = text.indexOf('Mindray');
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <Image src="/images/partners/mindray.webp" alt="Mindray" width={800} height={190} className="inline-block h-[1.05em] w-auto align-[-0.26em]" />
      {text.slice(at + 'Mindray'.length).replace(/^\./, '')}
    </>
  );
}

export default async function ServicesPage() {
  const { whyChoose } = await getSite();
  return (
    <>
      <SitePageHero page="services" />
      {/* The product catalogue first, then the end-to-end solutions */}
      <CatalogueGrid />
      <DepartmentSolutions />
      <Services />

      <section id="why-choose-us" className="pattern-cross scroll-mt-28 bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">
              We are the Official distributor of{' '}
              {/* The Mindray logo in place of the name: its letters sit three quarters of the way down the image (the rest is
                  the tail of the y), so lowering it by a quarter of its height puts them on the heading's baseline */}
              <Image src="/images/partners/mindray.webp" alt="Mindray" width={800} height={190} className="inline-block h-[1em] w-auto align-[-0.25em]" />
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
            {whyChoose.map((w, i) => (
              <li key={w.title} className="bg-paper">
                <Reveal delay={i * 0.06} className="flex h-full flex-col p-7 lg:p-8">
                  <ToneIcon icon={why[i].icon} tone={why[i].tone} />
                  <h3 className="mt-7 text-xl font-bold leading-snug tracking-[-0.02em]">{w.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-3">{withMindrayLogo(w.body)}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
