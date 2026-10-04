import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/home/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { distributors } from '@/data/seed';
import type { Category, Product } from '@/lib/types';

/**
 * Home: the five product categories as simple cards, each with a real product photo from that
 * category and a live product count, so visitors see what is actually on offer.
 */
export function ProductUniverse({ categories, products = [] }: { categories: Category[]; products?: Product[] }) {
  const count = (slug: string) => products.filter((p) => p.category === slug).length;
  const image = (c: Category) => c.image ?? products.find((p) => p.category === c.slug && p.image)?.image;

  return (
    <section aria-labelledby="product-universe-title" className="relative isolate overflow-hidden bg-brand-800 py-16 md:py-28">
      {/* Deep brand green with a soft lift of light: calm, and the cards read without white panels */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_15%_0%,rgb(127_209_165/0.1),transparent_60%),linear-gradient(180deg,#0a5d63,#075056)]" />
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            label="Solutions"
            title={
              <span id="product-universe-title">
                Every department. <span className="text-brand-300">One catalogue.</span>
              </span>
            }
            lead={`${products.length ? `${products.length} products across ${categories.length} departments, from analysers to hospital furniture. ` : ''}Official distributor of ${distributors.slice(0, -1).join(', ')} and ${distributors.at(-1)}, with installation, training and after-sales support on everything we supply.`}
          />
          <Reveal>
            <Button asChild variant="glass">
              <Link href="/products">
                Browse the catalogue
              </Link>
            </Button>
          </Reveal>
        </div>

        <ul className="swipe-row mt-10 md:mt-14 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {categories.map((c, i) => {
            const src = image(c);
            const n = count(c.slug);
            return (
              <li key={c.slug}>
                <Reveal delay={0.05 * i} className="h-full">
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="group flex h-full flex-col rounded-3xl bg-white/[0.07] p-3 ring-1 ring-white/10 transition-[background-color,transform] duration-300 hover:-translate-y-1 hover:bg-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {/* A soft mint tile (not white): the product photos’ white backgrounds blend into it */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                      {src ? (
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 240px, (min-width: 768px) 33vw, 84vw"
                          className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <Icon name={c.icon} className="absolute inset-0 m-auto size-fit text-5xl text-brand-600/60" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                      <h3 className="text-[1.0625rem] font-semibold leading-snug text-white">{c.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/75">{c.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-brand-300">
                        {n > 0 ? `${n} product${n === 1 ? '' : 's'}` : 'Explore'}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
