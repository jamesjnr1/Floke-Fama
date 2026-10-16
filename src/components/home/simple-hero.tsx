import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Seal } from '@/components/home/collage-hero';
import { equipment } from '@/data/equipment';
import { getSite } from '@/lib/site';

/**
 * The 'simple' hero: everything centred on the green gradient (seal, headline, lead and the two actions), with the
 * eight equipment types in one even row of photos underneath. No slideshow.
 */
export async function SimpleHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-10 px-5 py-12 md:px-10 lg:gap-9 lg:py-6">
        <Reveal className="flex flex-col items-center text-center">
          <Seal className="!size-[80px]" />
          <h1 className="mt-6 max-w-[1100px] text-[clamp(2.375rem,1.3rem+2.4vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
            {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
          </h1>
          <p className="no-justify mt-4 max-w-[720px] text-[1.0625rem] leading-relaxed text-white/85">
            From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </Reveal>

        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {equipment.map((e) => (
            <li key={e.slug}>
              <Link href="/services#equipment" className="group block">
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={e.image} alt="" fill sizes="(min-width: 1024px) 160px, 50vw" className="object-cover transition-transform duration-500 [filter:saturate(0.85)] group-hover:scale-105" />
                </span>
                <span className="mt-2 block text-[0.8125rem] font-medium text-white/80 transition-colors group-hover:text-white">{e.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
