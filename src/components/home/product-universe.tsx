import Link from 'next/link';
import { SectionHeading } from '@/components/home/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProductUniverse({ categories }: { categories: Category[]; products?: Product[] }) {
  return (
    <section className="relative py-14 md:py-40">
      <div className="grid-fade-light absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading label="The product universe" title={<>Every department. <span className="text-brand-600">One catalogue.</span></>} lead="From flagship analysers to the cuvettes that keep them running. Search, filter and compare in real time." />
          <Button asChild variant="dark" size="lg">
            <Link href="/products">Browse the catalogue <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
        </div>

        <div className="swipe-row mt-10 gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06} className={cn(i < 2 ? 'lg:col-span-3' : 'lg:col-span-2')}>
              <Link
                href={`/products?category=${c.slug}`}
                className="group relative flex h-full min-h-[220px] md:min-h-[240px] flex-col justify-between overflow-hidden rounded-4xl border border-line bg-paper p-7 transition-all duration-700 ease-out-expo hover:-translate-y-1 hover:border-transparent hover:shadow-[0_30px_60px_-30px_rgb(0_40_21/0.35)]"
              >
                <Icon name={c.icon} className="pointer-events-none absolute -bottom-10 -right-6 text-[11rem] text-brand-600/[0.07] transition-[transform,color] duration-1000 ease-out-expo group-hover:-rotate-6 group-hover:scale-110 group-hover:text-brand-600/[0.12]" />
                <div className="relative mt-auto">
                  <h3 className="text-2xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-2 max-w-sm text-sm font-light text-ink-3">{c.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                    Explore <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
