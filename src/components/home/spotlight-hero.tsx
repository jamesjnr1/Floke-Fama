import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Seal } from '@/components/home/collage-hero';
import { EquipmentSpotlight } from '@/components/home/equipment-spotlight';
import { getSite } from '@/lib/site';

/**
 * The 'spotlight' hero: the green gradient with the text on the left, one equipment photo filling the right side and
 * melting into the green, and a numbered index of the eight types between them (see EquipmentSpotlight).
 */
export async function SpotlightHero() {
  const { hero } = await getSite();
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(160deg,#0a5a33_0%,#06482a_55%,#043822_100%)] pt-[72px] text-white lg:min-h-0 lg:flex-1">
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(50%_55%_at_12%_30%,rgb(127_209_165/0.13),transparent_70%)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 [mask-image:radial-gradient(60%_80%_at_15%_55%,black,transparent_75%)]"
        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M22 17v10M17 22h10' stroke='white' stroke-opacity='0.07' stroke-width='1.4' stroke-linecap='round'/></svg>")` }}
      />

      <EquipmentSpotlight>
        <Reveal className="max-w-[520px]">
          <h1 className="text-[clamp(2.5rem,1.4rem+2.8vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
            {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
          </h1>
          <p className="no-justify mt-6 max-w-[460px] text-[1.0625rem] leading-relaxed text-white/85">
            From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
              <Link href="/products">Explore Solutions</Link>
            </Button>
            <Button asChild size="lg" variant="red" arrow="right">
              <Link href="/support">Contact Us</Link>
            </Button>
          </div>
        </Reveal>
      </EquipmentSpotlight>
      <Seal className="absolute bottom-10 right-10 z-10 hidden lg:block" />
    </section>
  );
}
