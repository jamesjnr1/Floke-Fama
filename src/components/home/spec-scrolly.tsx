import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * In-vitro diagnostics in one calm view. Every product named here is in the current
 * flokefama.com catalogue; the photo shows Flokefama's application specialists at a client lab,
 * from the Media Centre.
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
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="label !text-brand-300">In-vitro diagnostics · Official Mindray distributor</p>
            <h2 className="display mt-4 text-[clamp(34px,7vw,64px)] text-white">Diagnostics you can trust.</h2>
            <p className="mt-5 max-w-md font-light text-white/70">
              Calibrated on day one, supported every day after. Analysers, reagents and the engineers who keep them running, for labs across Ghana.
            </p>
            <Button asChild variant="glass" className="mt-8">
              <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-4xl">
            <Image
              src="/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-2.webp"
              alt="Flokefama specialists with laboratory staff at a client facility"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>

        <dl className="mt-14 grid gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {areas.map((a) => (
            <div key={a.title}>
              <dt className="font-semibold tracking-tight text-white">{a.title}</dt>
              <dd className="mt-2 text-sm font-light leading-relaxed text-white/60">{a.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
