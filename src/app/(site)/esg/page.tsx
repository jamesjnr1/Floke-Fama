import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { purpose } from '@/data/seed';

export const metadata: Metadata = {
  title: 'ESG',
  description: 'Patient safety, community, education, local industry and governance: how Flokefama creates value beyond supply.',
  alternates: { canonical: '/esg' },
};

const vision = purpose.find((p) => p.label === 'Vision')!;
const aim = purpose.find((p) => p.label === 'Aim')!;

/** Every item below is drawn from Flokefama’s own published news, About page and awards. */
const pillars = [
  {
    letter: 'S',
    label: 'Social · Patient safety',
    icon: 'fi-rr-shield-check',
    title: 'Quality is tested, not assumed.',
    body: 'Analysers, reagents and IVD kits directly inform clinical decisions. We verify quality before delivery, because every result protects a patient.',
  },
  {
    letter: 'S',
    label: 'Social · Community',
    icon: 'fi-rr-hand-holding-heart',
    title: 'Supporting the ZoDF Ramadan programme.',
    body: 'In March 2026 Flokefama supported the ZoDF Ramadan distribution programme, serving communities beyond the hospital walls.',
  },
  {
    letter: 'S',
    label: 'Social · Education',
    icon: 'fi-rr-graduation-cap',
    title: 'Shaping Ghana’s next biomedical engineers.',
    body: 'A partnership with the University of Ghana School of Engineering, alongside hands-on training and capacity building for clinical teams nationwide.',
  },
  {
    letter: 'G',
    label: 'Governance',
    icon: 'fi-rr-badge-check',
    title: 'Honesty and integrity, on record.',
    body: 'Honesty and integrity guide every dealing. Flokefama is ranked among Ghana’s top companies in the Ghana Club 100 (Ghana Investment Promotion Centre), and our vision includes listing on the Ghana Stock Exchange by 2030.',
  },
] as const;

export default function EsgPage() {
  return (
    <>
      <PageHero
        label="ESG"
        title={<>Healthcare that <span className="text-gradient">gives back</span></>}
        lead="How Flokefama creates value beyond supply: for patients, for communities and for Ghana’s economy."
      />

      <section className="bg-paper py-14 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <ul className="swipe-row gap-4 md:grid-cols-2">
            {pillars.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.06} className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-canvas p-8 md:p-10">
                  <span aria-hidden className="absolute -right-4 -top-10 select-none text-[10rem] font-bold leading-none text-brand-600/[0.06]">{p.letter}</span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-xl text-white"><Icon name={p.icon} /></span>
                  <p className="label mt-8">{p.label}</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">{p.title}</h2>
                  <p className="mt-3 leading-relaxed text-ink-3">{p.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Local industry: the long-term commitment */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#1b5e37_0%,#134228_55%,#0e3320_100%)] py-24 text-white md:py-32">
        <div aria-hidden className="absolute -right-40 -top-40 -z-10 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(143_209_169/0.18),transparent_65%)]" />
        <div className="mx-auto grid max-w-[1280px] items-start gap-12 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="label !text-brand-100">Economic · Local industry</p>
            <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-white">Made in Ghana, for Ghana.</h2>
            <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-white/75">Our long-term commitment goes beyond distribution: building the capacity to make what Ghana’s healthcare needs, here.</p>
          </Reveal>
          <ul className="swipe-row gap-4 md:grid-cols-2">
            {[aim, vision].map((p, i) => (
              <li key={p.label}>
                <Reveal delay={0.08 * (i + 1)} className="flex h-full flex-col rounded-4xl border border-white/15 bg-white/[0.08] p-7">
                  <Icon name={p.icon} className="text-2xl text-brand-100" />
                  <p className="label mt-8 !text-brand-100">Our {p.label.toLowerCase()}</p>
                  <p className="mt-3 text-lg leading-relaxed text-white">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
