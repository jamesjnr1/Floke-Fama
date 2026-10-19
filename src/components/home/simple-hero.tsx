import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';

/** The moving row on the hero: products from the shop, as product photos on white, shown whole. */
const heroItems = [
  { slug: 'autoclave-machine-35l', title: 'Autoclave Machine 35L' },
  { slug: 'biological-microscope', title: 'Biological Microscope' },
  { slug: 'cpap-machine', title: 'CPAP Machine' },
  { slug: 'dp-10-ultrasound', title: 'DP-10 Ultrasound' },
  { slug: 'omron-m7', title: 'Omron M7 Blood Pressure Monitor' },
  { slug: 'oxygen-cylinder-40l', title: 'Oxygen Cylinder 40L' },
  { slug: 'emergency-trolley', title: 'Emergency Trolley' },
].map((p) => ({ key: p.slug, title: p.title, image: `/images/products/${p.slug}.webp`, href: `/products/${p.slug}`, cutout: true }));

/**
 * The 'simple' hero: everything centred on the green gradient (headline, lead and the two actions), with the
 * equipment row underneath (see heroItems) moving slowly across.
 */
export async function SimpleHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_20%,rgb(127_209_165/0.14),transparent_70%)]" />

      <div className="flex w-full flex-1 flex-col items-center gap-10 px-5 py-12 md:px-10 lg:min-h-0 lg:gap-8 lg:px-8 lg:pb-6 lg:pt-14 [@media(min-height:1000px)]:lg:gap-12 [@media(min-height:1000px)]:lg:pt-24">
        <Reveal className="flex flex-col items-center text-center">
          {/* The company name first, as its own logotype, then the claim */}
          <h1 className="flex max-w-[1100px] flex-col items-center text-white">
            <span className="flex items-center gap-[0.35em] text-[clamp(3rem,1.6rem+4.4vw,5.5rem)]">
              <LogoMark className="size-[1.05em]" />
              <LogoWordmark className="h-[0.7em] text-white" />
              <span className="sr-only">Flokefama,</span>
            </span>
            <span className="mt-4 text-[clamp(1.75rem,1.1rem+1.9vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
              {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="no-justify mt-4 max-w-[760px] text-[1.0625rem] lg:max-w-[880px] leading-relaxed text-white/85">
            Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-5">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
            {/* A small text link to the CEO's profile and message on the About page */}
            <Link href="/about#ceo" className="group flex w-full items-center justify-center gap-1.5 text-[0.9375rem] font-medium text-white/80 transition-colors hover:text-white lg:ml-4 lg:w-auto">
              <span className="underline decoration-white/30 underline-offset-4 group-hover:decoration-white">A message from our CEO</span> <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </div>
        </Reveal>

        {/* The equipment photos move slowly from right to left in one row (paused on hover; still if motion is reduced) */}
        <div className="w-full overflow-hidden lg:min-h-[215px] lg:flex-1">
          <ul className="flex h-[230px] w-max animate-marquee [animation-duration:60s] hover:[animation-play-state:paused] motion-reduce:animate-none lg:h-full">
            {[false, true].flatMap((hidden) =>
              heroItems.map((e) => (
                <li key={`${e.key}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="h-full shrink-0 pr-3">
                  <Link href={e.href} tabIndex={hidden ? -1 : undefined} className="group flex h-full w-[clamp(260px,25vw,440px)] flex-col">
                    <span className={e.cutout ? 'relative block min-h-0 flex-1 overflow-hidden bg-white' : 'relative block min-h-0 flex-1 overflow-hidden'}>
                      <Image
                        src={e.image}
                        alt={hidden ? '' : e.title}
                        fill
                        sizes="440px"
                        className={e.cutout ? 'object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]' : 'object-cover [filter:saturate(0.85)] transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:[filter:saturate(1)]'}
                      />
                    </span>
                    <span className="mt-2 block truncate text-[0.8125rem] font-medium text-white/80 transition-colors group-hover:text-white">{e.title}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
