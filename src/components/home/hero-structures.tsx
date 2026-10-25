import Image from 'next/image';
import Link from 'next/link';
import { pillars } from '@/components/home/capabilities';
import { Reveal } from '@/components/motion/reveal';
import { LogoWordmark } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { metrics } from '@/data/seed';

/**
 * Five more hero structures, each followed by the Clients & Partners band as now: 'split' (the text on the left, a
 * photo on the right, the figures underneath), 'centered' (the claim alone in the middle of the green), 'overlay'
 * (the text over a full-width photo), 'grid' (the headline with the four pillars as tiles) and 'asymmetric' (a large
 * headline on the left, mission, vision and aim on the right).
 */

const green = 'bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)]';
const lead = 'Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.';

const Claim = () => (
  <>
    Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
  </>
);

function Actions({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Button asChild size="lg" arrow="up-right" className={light ? '' : 'bg-white text-[#00703A] hover:bg-white/90'}>
        <Link href="/products">Explore Solutions</Link>
      </Button>
      <Button asChild size="lg" variant="red" arrow="right">
        <Link href="/support">Contact Us</Link>
      </Button>
    </div>
  );
}

/** Split: the text on the left with the figures under it, a photo on the right. */
export function SplitHero() {
  return (
    <section className="bg-paper pt-[72px]">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="inline-block bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Saving lives since 2008</p>
          <h1 className="mt-5 text-[clamp(2.5rem,1.4rem+3vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">
            <Claim />
          </h1>
          <p className="no-justify mt-5 max-w-xl text-lg leading-relaxed text-ink-3">{lead}</p>
          <Actions light className="mt-8" />
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              [`${metrics[0].value}${metrics[0].suffix ?? ''}`, 'Hospitals and laboratories'],
              [`${metrics[1].value}${metrics[1].suffix ?? ''}`, 'System integrations'],
              ['No.1', 'Ghana Club 100'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="text-3xl font-bold tracking-[-0.03em] text-brand-700">{n}</dt>
                <dd className="mt-1 text-sm text-ink-3">{l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.08} className="relative">
          <div className="relative aspect-[4/3.4] overflow-hidden bg-mist">
            <Image src="/images/pillars/biomedical-lab.webp" alt="A Flokefama engineer at work in the laboratory" fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden bg-white p-5 shadow-[0_20px_40px_-24px_rgb(11_21_16/0.35)] md:block">
            <p className="text-sm text-ink-3">Official distributor</p>
            <p className="font-semibold text-ink">Mindray in Ghana</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Centered: the wordmark, the claim, the text and the actions, alone in the middle of the green. */
export function CenteredHero() {
  return (
    <section className={`relative isolate overflow-hidden ${green} pt-[72px] text-white`}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_30%,rgb(127_209_165/0.14),transparent_70%)]" />
      <Reveal className="mx-auto flex max-w-[960px] flex-col items-center px-5 py-24 text-center md:py-32">
        <p className="bg-white/10 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-300">Healthcare partner you can trust</p>
        <h1 className="mt-7 flex flex-col items-center !text-white">
          <span className="flex items-center text-[clamp(3rem,1.6rem+4.4vw,5.5rem)]">
            <LogoWordmark className="h-[0.75em] text-white" />
            <span className="sr-only">Flokefama,</span>
          </span>
          <span className="mt-4 text-[clamp(1.75rem,1.1rem+1.9vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
            <Claim />
          </span>
        </h1>
        <p className="no-justify mt-6 max-w-[760px] text-lg leading-relaxed text-white/80">{lead}</p>
        <Actions className="mt-9 justify-center" />
      </Reveal>
    </section>
  );
}

/** Overlay: the text over a full-width photo, darkened towards the left. */
export function OverlayHero() {
  return (
    <section className="relative isolate overflow-hidden pt-[72px] text-white">
      <Image src="/images/hero-head-office.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(4_42_25/0.94)_0%,rgb(4_42_25/0.75)_45%,rgb(4_42_25/0.25)_100%)]" />
      <div className="mx-auto flex min-h-[620px] max-w-[1280px] items-center px-5 py-20 md:px-10">
        <Reveal className="max-w-2xl">
          <p className="inline-block bg-white/10 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-300">From diagnostics to delivery</p>
          <h1 className="mt-6 text-[clamp(2.5rem,1.4rem+3vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] !text-white">
            <Claim />
          </h1>
          <p className="no-justify mt-5 text-lg leading-relaxed text-white/85">{lead}</p>
          <Actions className="mt-8" />
        </Reveal>
      </div>
    </section>
  );
}

/** Grid: the headline and text side by side, the four pillars as tiles underneath. */
export function GridHero() {
  const spans = ['md:col-span-2 md:row-span-2', '', '', 'md:col-span-2'];
  return (
    <section className={`relative isolate overflow-hidden ${green} pt-[72px] text-white`}>
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 md:py-20">
        <Reveal className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
          <h1 className="text-[clamp(2.5rem,1.4rem+3vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] !text-white">
            <Claim />
          </h1>
          <div>
            <p className="no-justify text-lg leading-relaxed text-white/80">{lead}</p>
            <Actions className="mt-7" />
          </div>
        </Reveal>
        <div className="mt-12 grid auto-rows-[190px] gap-4 md:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05} className={spans[i]}>
              <Link href="/products" className="group relative block h-full overflow-hidden bg-white">
                <Image src={p.image} alt="" fill sizes="(min-width: 768px) 600px, 100vw" className={`${p.image.includes('/pillars/') ? 'object-cover' : 'object-contain p-6 pb-20'} transition-transform duration-500 group-hover:scale-[1.04]`} />
                <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgb(4_42_25/0.92),rgb(4_42_25/0.75))] p-4">
                  <span className="block font-semibold text-white">{p.title}</span>
                  <span className="mt-0.5 block truncate text-sm text-white/70">{p.body}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Asymmetric: a large headline on the left, mission, vision and aim on the right. */
export function AsymmetricHero() {
  const purpose = [
    ['Mission', 'World class medical solutions for hospitals and laboratories across West Africa.'],
    ['Vision', 'Local production, and a listing on the Ghana Stock Exchange by 2030.'],
    ['Aim', 'A production plant in Ghana, creating meaningful jobs.'],
  ];
  return (
    <section className="bg-paper pt-[72px]">
      <div className="mx-auto grid max-w-[1280px] items-end gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="inline-block bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">End-to-end service</p>
          <h1 className="mt-5 text-[clamp(2.75rem,1.4rem+3.6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
            Ghana’s No.1
            <span className="block text-brand-700">
              Healthcare Company<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="no-justify mt-6 max-w-xl text-lg leading-relaxed text-ink-3">{lead}</p>
          <Actions light className="mt-8" />
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-4 lg:col-start-9">
          <ul className="space-y-6 bg-brand-50 p-7">
            {purpose.map(([t, d]) => (
              <li key={t}>
                <p className="font-semibold text-brand-700">{t}</p>
                <p className="no-justify mt-1 leading-relaxed text-ink-3">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
