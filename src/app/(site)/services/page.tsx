import type { Metadata } from 'next';
import { Services } from '@/components/home/services';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { IconTile } from '@/components/ui/icon';
import { whyChoose } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Products & Services',
  description: 'Medical equipment sales, installation, maintenance, calibration, repairs and training, from the official distributor of Mindray, Biozek Holland and MR Global.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        label="Products & services"
        title={<>We go beyond just supplying <span className="text-gradient">medical equipment</span></>}
        lead="End-to-end solutions, from procurement and installation to training and maintenance."
      />
      <Services />

      <section id="why-choose-us" className="scroll-mt-28 border-t border-line bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">Why choose Flokefama?</p>
            <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">
              We are the Official distributor of <span className="text-brand-600">Mindray, Biozek Holland, and MR Global.</span>
            </h2>
          </Reveal>
          <ul className="swipe-row mt-10 gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((w, i) => (
              <li key={w.title}>
                <Reveal delay={i * 0.06} className="h-full rounded-3xl border border-line bg-canvas p-7">
                  <IconTile name={w.icon} />
                  <h3 className="mt-8 text-xl font-bold tracking-[-0.02em]">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">{w.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
