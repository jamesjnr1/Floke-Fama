import type { Metadata } from 'next';
import { AwardsGallery } from '@/components/awards/awards-gallery';
import { Testimonials } from '@/components/home/testimonials';
import { PageHero } from '@/components/layout/page-hero';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { companyFigures } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Ranked No.1 in the Healthcare sector at the Ghana Club 100 Awards, Mindray Market Breakthrough and Best in IVD, and more.',
  alternates: { canonical: '/awards' },
};

export default function AwardsPage() {
  return (
    <>
      <PageHero
        label="Awards"
        title={<>Recognitions that <span className="text-gradient">reflect our impact</span></>}
        lead="Our commitment to excellence, innovation and service has earned the trust of countless healthcare institutions, and prestigious awards and honours along the way."
      >
        <dl className="grid max-w-2xl grid-cols-3 gap-3">
          {companyFigures.map((m) => (
            <div key={m.label} className="glass rounded-3xl p-5">
              <dd className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                <CountUp value={m.value} suffix={m.suffix} />
              </dd>
              <dt className="mt-1 text-xs text-white/50">{m.label}</dt>
            </div>
          ))}
        </dl>
      </PageHero>
      <AwardsGallery />
      <Reveal>
        <section className="border-y border-line bg-paper py-16">
          <p className="mx-auto max-w-4xl px-5 text-center text-xl font-light leading-relaxed text-ink-3 md:text-2xl">
            These accolades are a testament to the <strong className="font-semibold text-ink">hard work of our team</strong>, the{' '}
            <strong className="font-semibold text-ink">quality of our solutions</strong>, and the positive impact we’ve made in transforming healthcare delivery across Ghana and West Africa.
          </p>
        </section>
      </Reveal>
      <Testimonials />
    </>
  );
}
