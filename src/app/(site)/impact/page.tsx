import type { Metadata } from 'next';
import { BentoGrid } from '@/components/home/BentoGrid';
import { FinalCta } from '@/components/home/final-cta';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { IconTile } from '@/components/ui/icon';
import { purpose } from '@/data/seed';
import { getMetrics } from '@/lib/data';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Institutional Impact',
  description: 'Since 2008, Flokefama has equipped hospitals and laboratories across Ghana and West Africa. Our mission, vision and impact.',
  alternates: { canonical: '/impact' },
};

export default async function ImpactPage() {
  const metrics = await getMetrics();
  return (
    <>
      <PageHero
        label="Institutional impact"
        title={<>Building Ghana’s healthcare capacity <span className="text-gradient">since 2008</span></>}
        lead="A Ghana Club 100 company equipping public and private hospitals, laboratories and clinics across Ghana and the West African sub-region."
      />
      <BentoGrid metrics={metrics} />
      <section className="border-t border-line bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">What drives us</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">A mission that reaches beyond supply.</h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {purpose.map((p, i) => (
              <li key={p.label}>
                <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-3xl border border-line bg-canvas p-7">
                  <IconTile name={p.icon} />
                  <p className="label mt-8">{p.label}</p>
                  <p className="mt-3 text-lg leading-relaxed text-ink">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
