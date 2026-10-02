import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * In-vitro diagnostics in one calm view. Every product named here is in the current
 * flokefama.com catalogue. Photo: Andrew Oklu on Unsplash (unsplash.com/photos/TZUjC1TyPBg),
 * free to use under the Unsplash License.
 */
const areas = [
  { title: 'Haematology', body: 'Mindray BC-5150, BC-3000plus, BC-30s and BC-20s analysers.' },
  { title: 'Clinical chemistry', body: 'Semi-automated analysers, BS-230 cuvettes, reagents and controls.' },
  { title: 'Urinalysis & microscopy', body: 'UA-66 urine analysers and Olympus CX23 microscopes.' },
  { title: 'Installed & supported', body: 'Installation, calibration, maintenance and training across six branches.' },
];

export function SpecScrolly() {
  return (
    <section className="bg-[linear-gradient(135deg,#17402b_0%,#10301f_55%,#0b2418_100%)] py-16 text-white md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <Reveal>
          <p className="label !text-brand-300">In-vitro diagnostics · Official Mindray distributor</p>
          <h2 className="display mt-4 text-[clamp(34px,6vw,60px)] text-white">Diagnostics you can trust.</h2>
          <p className="mt-5 max-w-md font-light text-white/70">Calibrated on day one, supported every day after.</p>

          <ol className="mt-10 border-b border-white/10">
            {areas.map((a, i) => (
              <li key={a.title} className="flex gap-6 border-t border-white/10 py-5">
                <span className="w-6 shrink-0 pt-0.5 text-sm font-medium tabular-nums text-brand-300">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-semibold tracking-tight text-white">{a.title}</p>
                  <p className="mt-1 text-sm font-light text-white/60">{a.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button asChild variant="glass" className="mt-10">
            <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
        </Reveal>

        <Reveal delay={0.1} className="relative order-first aspect-[4/3] overflow-hidden rounded-4xl lg:order-none lg:aspect-[4/5]">
          <Image
            src="/images/diagnostics-microscope.jpg"
            alt="A laboratory scientist examining a sample under a microscope"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover object-[50%_68%]"
          />
          <div className="absolute inset-0 rounded-4xl ring-1 ring-inset ring-white/10" />
        </Reveal>
      </div>
    </section>
  );
}
