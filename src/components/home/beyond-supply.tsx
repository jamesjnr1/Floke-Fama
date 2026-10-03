import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Home: the "we go beyond just supplying medical equipment" introduction from the current site,
 * word for word, beside an equipment image supplied by the site owner.
 */
export function BeyondSupply() {
  return (
    <section aria-labelledby="beyond-supply-title" className="border-y border-line bg-paper py-16 md:py-28">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 md:px-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Reveal>
          <h2 id="beyond-supply-title" className="display text-[clamp(2rem,1.3rem+2vw,2.875rem)] leading-[1.1] text-ink">
            At Flokefama Limited, we go beyond just supplying medical equipment
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-3">
            We offer a <strong className="font-semibold text-ink-2">comprehensive range of services</strong> designed to ensure{' '}
            <strong className="font-semibold text-ink-2">efficiency, reliability, and long-term value</strong> for healthcare facilities. Our expert team provides{' '}
            <strong className="font-semibold text-ink-2">end-to-end solutions</strong>, from procurement and installation to training and maintenance, ensuring that our clients get the most out of
            their investment.
          </p>
          <Button asChild className="mt-9">
            <Link href="/about">
              About us <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-square">
          <Image
            src="/images/home-equipment.webp"
            alt="Hospital equipment: an oxygen concentrator, a hospital bed, a patient monitor and a wheelchair"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
