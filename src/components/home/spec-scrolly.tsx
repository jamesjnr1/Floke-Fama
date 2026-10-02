import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * In-vitro diagnostics in one view. Every product named here is in the current
 * flokefama.com catalogue and shows its own catalogue photo; the support card uses a photo of
 * Flokefama's application specialists at a client lab, from the Media Centre.
 */
const products = [
  {
    label: 'Haematology',
    title: 'Complete blood counts, from clinic to teaching hospital.',
    body: 'Mindray BC-5150, BC-3000plus, BC-30s and BC-20s analysers.',
    image: { src: '/images/products/auto-heamatology-analyzer-bc5150.webp', alt: 'Mindray BC-5150 auto haematology analyser' },
    wide: true,
  },
  {
    label: 'Clinical chemistry',
    title: 'Chemistry with matched reagents.',
    body: 'Semi-automated analysers, BS-230 cuvettes, reagents and controls.',
    image: { src: '/images/products/semi-automated-chemistry-analysermindray.webp', alt: 'Mindray BA-88A semi-automated chemistry analyser' },
    wide: false,
  },
  {
    label: 'Urinalysis & microscopy',
    title: 'The everyday tests, done right.',
    body: 'UA-66 urine analysers and Olympus CX23 microscopes.',
    image: { src: '/images/products/urine-analyzer-ua-66.webp', alt: 'UA-66 urine analyser' },
    wide: false,
  },
];

export function SpecScrolly() {
  return (
    <section className="bg-midnight py-16 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label !text-brand-300">In-vitro diagnostics · Official Mindray distributor</p>
            <h2 className="display mt-4 text-[clamp(34px,7vw,64px)] text-white">Diagnostics you can trust.</h2>
          </div>
          <div className="md:max-w-sm">
            <p className="font-light text-white/60">Analysers, reagents and the engineers who keep them running, for labs across Ghana.</p>
            <Button asChild variant="glass" className="mt-5">
              <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <Reveal className="relative min-h-[440px] overflow-hidden rounded-4xl md:col-span-2 lg:row-span-2 lg:min-h-0">
            <Image
              src="/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-2.webp"
              alt="Flokefama specialists with laboratory staff at a client facility"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_21_16/0)_35%,rgb(11_21_16/0.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="label !text-brand-300">Installed & supported</p>
              <p className="mt-3 max-w-md text-2xl font-semibold tracking-tight md:text-3xl">Calibrated on day one. Supported every day after.</p>
              <p className="mt-2 max-w-md text-sm font-light text-white/70">Installation, calibration, preventive maintenance and training from engineers across six branches.</p>
            </div>
          </Reveal>

          {products.map((p, i) => (
            <Reveal
              key={p.label}
              delay={0.08 * (i + 1)}
              className={cn(
                'flex items-center gap-4 rounded-4xl border border-white/10 bg-white/[0.04] p-3 lg:items-stretch lg:p-4',
                p.wide ? 'md:col-span-2 lg:gap-6' : 'lg:flex-col',
              )}
            >
              <div className={cn('relative size-28 shrink-0 overflow-hidden rounded-3xl bg-white sm:size-36', p.wide ? 'lg:size-auto lg:w-[45%]' : 'lg:size-auto lg:aspect-[4/3] lg:w-full')}>
                <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-contain p-[10%] mix-blend-multiply" />
              </div>
              <div className={cn('py-1 pr-2', p.wide ? 'lg:self-center' : 'lg:px-2 lg:pb-2')}>
                <p className="label !text-white/45">{p.label}</p>
                <p className="mt-1.5 text-base font-semibold leading-snug sm:text-lg lg:mt-2 tracking-tight">{p.title}</p>
                <p className="mt-1 text-sm font-light text-white/60">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
