import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { equipment } from '@/data/equipment';
import { getSite } from '@/lib/site';

/**
 * The 'simple' hero: everything centred on the green gradient (headline, lead and the two actions), with the
 * eight equipment types in one even row of photos underneath. No slideshow.
 */
export async function SimpleHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />

      <div className="flex w-full flex-1 flex-col items-center gap-10 px-5 py-12 md:px-10 lg:min-h-0 lg:gap-8 lg:px-8 lg:pb-8 lg:pt-7">
        <Reveal className="flex flex-col items-center text-center">
          <h1 className="max-w-[1100px] text-[clamp(2.375rem,1.3rem+2.4vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
            {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
          </h1>
          <p className="no-justify mt-4 max-w-[760px] text-[1.0625rem] lg:max-w-[880px] leading-relaxed text-white/85">
            From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </Reveal>

        {/* On hover a photo widens in the row (the others narrow to make room) and shows what it is */}
        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:min-h-[240px] lg:flex-1">
          {equipment.map((e) => (
            <li key={e.slug} className="min-w-0 lg:flex-1 lg:transition-[flex-grow] lg:duration-500 lg:ease-[cubic-bezier(0.16,1,0.3,1)] lg:hover:flex-[3] lg:focus-within:flex-[3]">
              <Link href="/services#equipment" className="group flex h-full flex-col">
                <span className="relative block aspect-[16/10] overflow-hidden lg:aspect-auto lg:flex-1">
                  <Image src={e.image} alt="" fill sizes="(min-width: 1024px) 420px, 50vw" className="object-cover [filter:saturate(0.85)] transition-[filter] duration-500 group-hover:[filter:saturate(1)]" />
                  <span aria-hidden className="absolute inset-0 hidden bg-[linear-gradient(transparent_30%,rgb(4_40_24/0.85))] opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:block" />
                  <span className="absolute inset-x-3 bottom-2.5 hidden text-[0.8125rem] leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-200 lg:line-clamp-2">{e.text}</span>
                </span>
                <span className="mt-2 block truncate text-[0.8125rem] font-medium text-white/80 transition-colors group-hover:text-white">{e.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
