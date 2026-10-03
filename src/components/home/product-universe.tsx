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
    <section aria-labelledby="product-universe-title" className="bg-[linear-gradient(135deg,#17402b_0%,#10301f_55%,#0b2418_100%)] py-16 text-white md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            label="Solutions"
            title={
              <span id="product-universe-title">
                Every department. <span className="text-accent">One catalogue.</span>
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
                    className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-3 transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
                  >
                    {/* A soft sage tile, not stark white: the product photos’ white backgrounds blend into it */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#dbe9e0]">
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
                      <h3 className="text-[17px] font-semibold leading-snug text-white">{c.title}</h3>
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
