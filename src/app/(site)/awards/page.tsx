import type { Metadata } from 'next';
import { AwardsGallery } from '@/components/awards/awards-gallery';
import { Testimonials } from '@/components/home/testimonials';
import { PageHero } from '@/components/layout/page-hero';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';

const testament = [
  { title: 'The hard work of our team', body: 'Engineers, applications specialists and support staff across six branches, from Accra to Aflao.', value: 40, unit: 'team members' },
  { title: 'The quality of our solutions', body: 'Official Mindray, Biozek Holland and MR Global equipment, with original reagents and verified quality before delivery.', value: 200, unit: 'health products' },
  { title: 'Our impact on healthcare delivery', body: 'Transforming how hospitals and laboratories across Ghana and West Africa diagnose and care.', value: 700, unit: 'hospitals & labs served' },
];

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
      />
      <AwardsGallery />
      <section className="relative isolate overflow-hidden bg-midnight py-24 text-white md:py-32">
        <div aria-hidden className="absolute -left-40 top-0 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.22),transparent_65%)]" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label !text-brand-300">What these awards recognise</p>
            <h2 className="display mt-4 max-w-4xl text-[clamp(2rem,1.2rem+2.8vw,3.75rem)] text-white">
              Every accolade is a testament to <span className="text-gradient">three things.</span>
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-4xl border border-white/10 bg-white/10 md:grid-cols-3">
            {testament.map((t, i) => (
              <li key={t.title} className="bg-midnight">
                <Reveal delay={i * 0.08} className="flex h-full flex-col p-7 md:p-9">
                  <span className="font-mono text-sm text-brand-300">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-10 text-2xl font-bold leading-tight tracking-[-0.02em] text-white md:text-3xl">{t.title}</h3>
                  <p className="mt-3 font-light leading-relaxed text-white/60">{t.body}</p>
                  <p className="mt-auto pt-10 text-5xl font-bold tracking-[-0.04em] text-white/90">
                    <CountUp value={t.value} suffix="+" />
                    <span className="ml-2 align-middle text-xs font-normal tracking-normal text-white/45">{t.unit}</span>
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Testimonials />
    </>
  );
}
