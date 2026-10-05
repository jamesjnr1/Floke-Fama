import type { Metadata } from 'next';
import { Services } from '@/components/home/services';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Globe, Headset, Link2, MapPin } from 'lucide-react';
import { ToneIcon } from '@/components/ui/tone-icon';
import { whyChoose } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Products & Services',
  description: 'Medical equipment sales, installation, maintenance, calibration, repairs and training, from the official distributor of Mindray, Biozek Holland and MR Global.',
  alternates: { canonical: '/services' },
};

const why = [
  { icon: Link2, tone: 'green' },
  { icon: Globe, tone: 'blue' },
  { icon: Headset, tone: 'red' },
  { icon: MapPin, tone: 'amber' },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHero
        image="/images/headers/services.webp"
        position="50% 40%"
        label="Products & services"
        title={<>We go beyond just supplying <span className="text-brand-600">medical equipment</span></>}
        lead="End-to-end solutions, from procurement and installation to training and maintenance."
      />
      <Services />

      <section id="why-choose-us" className="scroll-mt-28 border-t border-line bg-paper py-14 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">
              We are the Official distributor of <span className="text-brand-600">Mindray, Biozek Holland, and MR Global.</span>
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
            {whyChoose.map((w, i) => (
              <li key={w.title} className="bg-paper">
                <Reveal delay={i * 0.06} className="flex h-full flex-col p-7 lg:p-8">
                  <ToneIcon icon={why[i].icon} tone={why[i].tone} />
                  <h3 className="mt-7 text-xl font-bold leading-snug tracking-[-0.02em]">{w.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-3">{w.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
