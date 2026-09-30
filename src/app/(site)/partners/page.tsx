import type { Metadata } from 'next';
import { FinalCta } from '@/components/home/final-cta';
import { Partners } from '@/components/home/partners';
import { PageHero } from '@/components/layout/page-hero';
import { Reveal } from '@/components/motion/reveal';
import { IconTile } from '@/components/ui/icon';

export const metadata: Metadata = {
  title: 'Technology Partners',
  description: 'Flokefama is the official distributor of Mindray, Biozek Holland and MR Global, trusted by leading hospitals across Ghana.',
  alternates: { canonical: '/partners' },
};

const commitments = [
  { icon: 'fi-rr-shield-check', title: 'Genuine, warrantied equipment', body: 'Supplied through official manufacturer channels, never grey imports.' },
  { icon: 'fi-rr-box-open', title: 'Original reagents & parts', body: 'Matched consumables and spare parts that keep systems in specification.' },
  { icon: 'fi-rr-settings', title: 'Local after-sales support', body: 'Installation, calibration and maintenance from six branches nationwide.' },
] as const;

export default function PartnersPage() {
  return (
    <>
      <PageHero
        label="Technology partners"
        title={<>Official distributor of <span className="text-gradient">world-class technology</span></>}
        lead="We represent leading manufacturers and serve Ghana’s foremost teaching hospitals, medical centres and private facilities."
      />
      <Partners heading={false} />
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <p className="label">What official distribution means</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">The manufacturer’s standard, delivered locally.</h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {commitments.map((c, i) => (
              <li key={c.title}>
                <Reveal delay={i * 0.06} className="h-full rounded-3xl border border-line bg-canvas p-7">
                  <IconTile name={c.icon} />
                  <h3 className="mt-8 text-xl font-bold tracking-[-0.02em]">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">{c.body}</p>
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
