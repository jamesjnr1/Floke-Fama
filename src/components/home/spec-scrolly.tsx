import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * In-vitro diagnostics, led by the words: headline and intro on top, then the photo beside
 * a 2 × 2 grid of the four areas. Every product named here is in the current flokefama.com catalogue.
 */
const areas = [
  { title: 'Haematology', body: 'Mindray BC-5150, BC-3000plus, BC-30s and BC-20s analysers.' },
  { title: 'Clinical chemistry', body: 'Semi-automated analysers, BS-230 cuvettes, reagents and controls.' },
  { title: 'Urinalysis & microscopy', body: 'UA-66 urine analysers and Olympus CX23 microscopes.' },
  { title: 'Installed & supported', body: 'Installation, calibration, maintenance and training across six branches.' },
];

export function SpecScrolly() {
  return (
    <section className="border-y border-line bg-paper py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label !text-brand-700">In-vitro diagnostics · Official Mindray distributor</p>
            <h2 className="display mt-4 text-[clamp(40px,7vw,76px)] text-ink">Diagnostics you can trust.</h2>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="text-lg font-light text-ink-2">
              Calibrated on day one, supported every day after. Analysers, reagents and the engineers who keep them running, for labs across Ghana.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:gap-10">
          <Reveal className="relative aspect-[626/510] overflow-hidden lg:col-span-5 lg:aspect-auto">
            <Image
              src="/images/diagnostics-microscope-lab.png"
              alt="A laboratory scientist looking through a microscope beside a rack of sample tubes"
              fill
              sizes="(min-width: 1024px) 500px, 100vw"
              className="object-cover"
            />
          </Reveal>

          <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-7">
            {areas.map((a, i) => (
              <li key={a.title} className="bg-paper p-5 md:p-8">
                <span className="text-sm font-semibold tabular-nums text-brand-600">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 text-lg font-semibold tracking-tight text-ink md:mt-10 md:text-xl">{a.title}</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink-3">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
