import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';

/** The four stages of the end-to-end service named in the text, in order. */
const stages = [
  { title: 'Procurement', body: 'The right equipment for your facility and budget, sourced from trusted manufacturers.' },
  { title: 'Installation', body: 'Set up, calibrated and commissioned on site by our biomedical engineers.' },
  { title: 'Training', body: 'Your clinicians and lab staff trained to use every system with confidence.' },
  { title: 'Maintenance', body: 'Preventive servicing, repairs and spare parts for the life of the equipment.' },
];

/**
 * How the section is laid out. 'green' (default): the text on a green panel beside the equipment photo, edge to
 * edge. 'steps': the text, then the four stages as numbered columns. 'banner': a full-width photo of an engineer at
 * work with the text and the stages over it. 'split': the earlier layout, text beside a framed photo.
 * Matching the rest of the home page: 'card' (a green block like the figures band, text and photo inside it),
 * 'mirror' (photo left, text right), 'intro' (heading and text side by side like the film section, then the four
 * stages in a green band like the figures) and 'overlap' (the photo with a green text card overlapping it).
 * Switch with NEXT_PUBLIC_BEYOND_LAYOUT in Vercel (then redeploy).
 */
const layouts = ['steps', 'banner', 'green', 'split', 'card', 'mirror', 'intro', 'overlap'] as const;
export type BeyondLayout = (typeof layouts)[number];
const env = process.env.NEXT_PUBLIC_BEYOND_LAYOUT as BeyondLayout | undefined;
const chosen: BeyondLayout = env && layouts.includes(env) ? env : 'green';

const Title = ({ className = 'text-ink' }: { className?: string }) => (
  <h2 id="beyond-supply-title" className={`display text-[clamp(2rem,1.3rem+2vw,2.875rem)] leading-[1.1] ${className}`}>
    At Flokefama Limited, we go beyond just supplying medical equipment
  </h2>
);

/** The text from the current site, word for word. */
const Text = ({ strong = 'text-ink-2', className = 'text-ink-3' }: { strong?: string; className?: string }) => (
  <p className={`no-justify mt-6 max-w-xl text-lg leading-relaxed ${className}`}>
    We offer a <strong className={`font-semibold ${strong}`}>comprehensive range of services</strong> designed to ensure{' '}
    <strong className={`font-semibold ${strong}`}>efficiency, reliability, and long-term value</strong> for healthcare facilities. Our expert team provides{' '}
    <strong className={`font-semibold ${strong}`}>end-to-end solutions</strong>, from procurement and installation to training and maintenance, ensuring that our clients get the most out of their
    investment.
  </p>
);

/** Home: the "we go beyond just supplying medical equipment" introduction from the current site. */
export function BeyondSupply({ layout = chosen }: { layout?: BeyondLayout }) {
  if (layout === 'banner') {
    return (
      <section aria-labelledby="beyond-supply-title" className="relative isolate overflow-hidden bg-midnight text-white">
        <Image src="/images/headers/services-technician.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[50%_40%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(22_35_42/0.92)_0%,rgb(22_35_42/0.75)_50%,rgb(22_35_42/0.45)_100%)]" />
        <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-16 md:py-28">
          <Reveal>
            <div className="max-w-2xl">
              <Title className="text-white" />
              <Text strong="text-white" className="text-white/80" />
              <Button asChild arrow="right" className="mt-9 bg-white text-brand-800 hover:bg-white/90">
                <Link href="/about">About us</Link>
              </Button>
            </div>
          </Reveal>
          <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
            {stages.map((s, i) => (
              <li key={s.title} className="bg-white/[0.08] p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold tabular-nums text-brand-300">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-white">{s.title}</h3>
                <p className="no-justify mt-2 text-[0.9375rem] leading-relaxed text-white/75">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  if (layout === 'card') {
    return (
      <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid overflow-hidden bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white lg:grid-cols-[1.1fr_1fr]">
            <div className="p-8 md:p-14">
              <Title className="text-white" />
              <Text strong="text-white" className="text-white/80" />
              <Button asChild arrow="right" className="mt-9 bg-white text-brand-800 hover:bg-white/90">
                <Link href="/about">About us</Link>
              </Button>
            </div>
            <div className="relative min-h-[320px]">
              <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  if (layout === 'mirror') {
    return (
      <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 md:px-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden lg:aspect-square">
            <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <Title />
            <Text />
            <Button asChild arrow="right" className="mt-9">
              <Link href="/about">About us</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    );
  }

  if (layout === 'intro') {
    return (
      <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-16">
            <Title />
            <div>
              <Text className="!mt-0 text-ink-3" />
              <Button asChild arrow="right" className="mt-8">
                <Link href="/about">About us</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="mt-12 md:mt-16">
            <ol className="grid divide-y divide-white/20 bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              {stages.map((s, i) => (
                <li key={s.title} className="p-7 md:p-8">
                  <p className="text-sm font-semibold tabular-nums text-brand-300">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-white">{s.title}</h3>
                  <p className="no-justify mt-2 text-[0.9375rem] leading-relaxed text-white/75">{s.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>
    );
  }

  if (layout === 'overlap') {
    return (
      <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="relative lg:min-h-[600px]">
            <Reveal className="relative aspect-[4/3] overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:w-[58%]">
              <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.1} className="relative bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] p-8 text-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] md:p-12 lg:absolute lg:right-0 lg:top-1/2 lg:w-[52%] lg:-translate-y-1/2">
              <Title className="text-white" />
              <Text strong="text-white" className="text-white/80" />
              <Button asChild arrow="right" className="mt-9 bg-white text-brand-800 hover:bg-white/90">
                <Link href="/about">About us</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'green') {
    return (
      <section aria-labelledby="beyond-supply-title" className="grid bg-paper lg:grid-cols-2">
        <div className="flex items-center bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_60%,#043822_100%)] px-5 py-16 text-white md:px-16 md:py-24">
          <Reveal className="max-w-xl">
            <Title className="text-white" />
            <Text strong="text-white" className="text-white/80" />
            <Button asChild arrow="right" className="mt-9 bg-white text-brand-800 hover:bg-white/90">
              <Link href="/about">About us</Link>
            </Button>
          </Reveal>
        </div>
        <div className="relative min-h-[360px] lg:min-h-[560px]">
          <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
    );
  }

  if (layout === 'split') {
    return (
      <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 md:px-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal>
            <Title />
            <Text />
            <Button asChild arrow="right" className="mt-9">
              <Link href="/about">About us</Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-square">
            <Image src="/images/home-equipment.webp" alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>
    );
  }

  // steps: the text in two columns, then the four stages as numbered columns
  return (
    <section aria-labelledby="beyond-supply-title" className="pattern-dots pattern-tr bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-16">
          <Title />
          <div>
            <Text className="!mt-0 text-ink-3" />
            <Button asChild arrow="right" className="mt-8">
              <Link href="/about">About us</Link>
            </Button>
          </div>
        </Reveal>
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {stages.map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 0.05} className="h-full bg-canvas p-7">
                <p className="font-extrabold leading-none tracking-[-0.04em] text-brand-700 text-4xl">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 text-xl font-bold tracking-[-0.02em] text-ink">{s.title}</h3>
                <p className="no-justify mt-2 text-[0.9375rem] leading-relaxed text-ink-3">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
