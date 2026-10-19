import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { equipment } from '@/data/equipment';
import { getSite } from '@/lib/site';

/** One pass of the photo row; the row is drawn twice so it loops without a jump. */
function Photos({ hidden = false }: { hidden?: boolean }) {
  return (
    <>
      {equipment.map((e, k) => (
        <li key={`${e.slug}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="h-full shrink-0 pr-3">
          <Link href="/products" tabIndex={hidden ? -1 : undefined} className="group relative block h-full w-[clamp(260px,24vw,420px)] overflow-hidden">
            <Image src={e.image} alt={hidden ? '' : e.title} fill priority={!hidden && k < 4} sizes="(min-width: 1024px) 420px, 260px" className="object-cover [filter:saturate(0.85)] transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:[filter:saturate(1)]" />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(transparent,rgb(4_40_24/0.75))]" />
            <span className="absolute bottom-4 left-4 text-[0.9375rem] font-semibold text-white">{e.title}</span>
          </Link>
        </li>
      ))}
    </>
  );
}

/**
 * The 'moving' hero: under the menu bar a large row of the eight equipment photos moving slowly from right to left
 * (paused on hover), and under it one clean line: the headline on the left, the short text and the two actions on
 * the right.
 */
export async function MovingHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[88px] text-white lg:min-h-0 lg:flex-1">
      <div className="h-[300px] overflow-hidden sm:h-[340px] lg:h-auto lg:min-h-[260px] lg:flex-1">
        <ul className="flex h-full w-max animate-marquee [animation-duration:70s] hover:[animation-play-state:paused] motion-reduce:animate-none">
          <Photos />
          <Photos hidden />
        </ul>
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-5 py-8 md:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:px-16 lg:py-8">
        <h1 className="text-[clamp(2.25rem,1.2rem+2.4vw,3.5rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
          {hero.title}
          <br className="hidden sm:block" /> {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
        </h1>
        <div className="max-w-[520px]">
          <p className="no-justify text-[0.9375rem] leading-relaxed text-white/80">
            From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
