import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Simple heroes with the product catalogue. 'catalogue-side': the wordmark, claim and actions on the left, four
 * products in a 2 × 2 grid on the right. 'catalogue-row': everything centred, six products in one still row
 * underneath. 'catalogue-panel': the text on the green, a white catalogue panel of four products below it.
 */

const green = 'bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)]';
const lead = 'Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.';

const products = [
  { slug: 'autoclave-machine-35l', title: 'Autoclave Machine 35L', tag: 'Sterilisation' },
  { slug: 'biological-microscope', title: 'Biological Microscope', tag: 'Laboratory' },
  { slug: 'cpap-machine', title: 'CPAP Machine', tag: 'Respiratory' },
  { slug: 'dp-10-ultrasound', title: 'DP-10 Ultrasound', tag: 'Imaging' },
  { slug: 'omron-m7', title: 'Omron M7 BP Monitor', tag: 'Monitoring' },
  { slug: 'emergency-trolley', title: 'Emergency Trolley', tag: 'Emergency' },
];

function Title({ center = false }: { center?: boolean }) {
  return (
    <h1 className={`flex flex-col !text-white ${center ? 'items-center' : ''}`}>
      {/* The company name in heavy, tightly set capitals */}
      <span className={`font-wordmark ${center ? 'text-[clamp(3.6rem,9vw,7.6rem)]' : 'text-[clamp(3.25rem,5.6vw,5.5rem)]'} font-black uppercase leading-[0.82] tracking-[-0.08em]`}>
        Floke Fama<span className="sr-only">,</span>
      </span>
      <span className="mt-5 text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em]">
        Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
      </span>
    </h1>
  );
}

function Actions({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
        <Link href="/products">Explore Solutions</Link>
      </Button>
      <Button asChild size="lg" variant="red" arrow="right">
        <Link href="/support">Contact Us</Link>
      </Button>
    </div>
  );
}

/** One product: the photo whole on white, the category and name under it. */
function Card({ p, dark = true, ratio = 'aspect-[4/3]' }: { p: (typeof products)[number]; dark?: boolean; ratio?: string }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <span className={`relative block overflow-hidden bg-white ${ratio}`}>
        <Image src={`/images/products/${p.slug}.webp`} alt={p.title} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]" />
      </span>
      <span className={`mt-2.5 block text-xs font-semibold uppercase tracking-[0.08em] ${dark ? 'text-brand-300' : 'text-brand-700'}`}>{p.tag}</span>
      <span className={`mt-0.5 block font-semibold leading-snug ${dark ? 'text-white' : 'text-ink group-hover:text-brand-700'}`}>{p.title}</span>
    </Link>
  );
}

/** Side: the text on the left, four products in a 2 × 2 grid on the right. */
export function CatalogueSideHero() {
  return (
    <section className={`${green} pt-[72px] text-white`}>
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Title />
          <p className="no-justify mt-5 max-w-xl text-lg leading-relaxed text-white/80">{lead}</p>
          <Actions className="mt-8" />
        </Reveal>
        <Reveal delay={0.08} className="grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((p) => (
            <Card key={p.slug} p={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** Row: everything centred, six products in one still row underneath. */
export function CatalogueRowHero() {
  return (
    <section className={`${green} pt-[72px] text-white`}>
      <div className="mx-auto max-w-[1280px] px-5 pb-14 pt-14 md:px-10 md:pt-20">
        <Reveal className="flex flex-col items-center text-center">
          <Title center />
          <p className="no-justify mt-5 max-w-[820px] text-lg leading-relaxed text-white/80">{lead}</p>
          <Actions className="mt-8 justify-center" />
        </Reveal>
        <Reveal delay={0.08} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((p) => (
            <Card key={p.slug} p={p} ratio="aspect-square" />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** Panel: the text on the green, then a white catalogue panel of four products. */
export function CataloguePanelHero() {
  return (
    <section className={`${green} pt-[72px] text-white`}>
      <div className="mx-auto max-w-[1280px] px-5 pb-12 pt-14 md:px-10 md:pt-20">
        <Reveal className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <Title />
          <div>
            <p className="no-justify text-lg leading-relaxed text-white/80">{lead}</p>
            <Actions className="mt-7" />
          </div>
        </Reveal>
        <Reveal delay={0.08} className="mt-12 bg-white p-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <p className="text-lg font-bold tracking-[-0.015em] text-ink">From our catalogue</p>
            <Link href="/products" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
              All products <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Card key={p.slug} p={p} dark={false} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
