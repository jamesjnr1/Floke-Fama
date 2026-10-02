import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * In-vitro diagnostics: centred heading, one wide photo and a floating bar with the four areas.
 * Every product named here is in the current flokefama.com catalogue. Photo: Amari Shutters on
 * Unsplash (unsplash.com/photos/Vw2O5QkDJQo), free to use under the Unsplash License.
 */
const areas = [
  { title: 'Haematology', body: 'Mindray BC-5150, BC-3000plus, BC-30s and BC-20s analysers.' },
  { title: 'Clinical chemistry', body: 'Semi-automated analysers, BS-230 cuvettes, reagents and controls.' },
  { title: 'Urinalysis & microscopy', body: 'UA-66 urine analysers and Olympus CX23 microscopes.' },
  { title: 'Installed & supported', body: 'Installation, calibration, maintenance and training across six branches.' },
];

export function SpecScrolly() {
  return (
    <section className="bg-brand-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label !text-brand-700">In-vitro diagnostics · Official Mindray distributor</p>
          <h2 className="display mt-4 text-[clamp(34px,6vw,60px)] text-ink">Diagnostics you can trust.</h2>
          <p className="mt-5 text-lg font-light text-ink-2">Calibrated on day one, supported every day after.</p>
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 aspect-[4/3] overflow-hidden rounded-4xl md:mt-14 md:aspect-[21/9]">
          <Image
            src="/images/diagnostics-blood-sample.jpg"
            alt="Laboratory scientists in gloves handling a blood sample tube"
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-[50%_40%]"
          />
        </Reveal>

        <div className="relative z-10 mx-3 -mt-10 grid gap-6 rounded-4xl bg-paper p-6 shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)] sm:grid-cols-2 md:mx-8 md:-mt-20 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line lg:px-0 lg:py-8">
          {areas.map((a) => (
            <div key={a.title} className="lg:px-7">
              <p className="font-semibold text-ink">{a.title}</p>
              <p className="mt-1.5 text-sm font-light text-ink-3">{a.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/products?category=in-vitro-diagnostics">Explore diagnostics <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
