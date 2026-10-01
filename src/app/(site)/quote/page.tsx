import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProcurementFlow } from '@/components/quote/procurement-flow';
import { Icon } from '@/components/ui/icon';
import { getCategories, getProducts } from '@/lib/data';

/** Which department a machine usually serves, from its Shop category (the visitor can change it). */
const departmentFor: Record<string, string> = {
  'in-vitro-diagnostics': 'laboratory',
  laboratory: 'laboratory',
  consumables: 'laboratory',
  'critical-care': 'icu',
  'hospital-equipment': 'opd',
};

export const metadata: Metadata = {
  title: 'Request a Quote or Demonstration',
  description: 'Tell us your department, equipment and timeline. A Flokefama specialist replies within one business day.',
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ intent?: string; product?: string; need?: string; docs?: string }> }) {
  const [{ intent, product, need, docs }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  const options = products.map((p) => ({ slug: p.slug, label: `${p.brand === 'Flokefama Select' ? '' : `${p.brand} `}${p.name}`, group: categories.find((c) => c.slug === p.category)?.title ?? 'Other' }));
  const preselected = [options.find((o) => o.slug === product)?.label, need?.trim()].filter((x): x is string => Boolean(x));
  // Coming from a product page: quote for that machine, with its department chosen from its category
  const chosen = products.find((p) => p.slug === product);
  const focus = chosen && { slug: chosen.slug, name: chosen.name, brand: chosen.brand, image: chosen.image, label: options.find((o) => o.slug === chosen.slug)!.label, category: categories.find((c) => c.slug === chosen.category)?.title };
  const department = chosen ? departmentFor[chosen.category] : undefined;
  const notes = chosen && docs ? `Please send the datasheet for the ${chosen.name}.` : undefined;

  return (
    <div className="bg-canvas pt-20">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">Procurement portal</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+3.5vw,4.5rem)]">
            {focus ? (intent === 'demo' ? 'Book a demonstration.' : 'Request a quote.') : 'Tell us what your facility needs.'}
          </h1>
          {focus && (
            <div className="mt-8 overflow-hidden rounded-4xl border border-line bg-paper" data-testid="quote-focus">
              <div className="relative aspect-[16/10] bg-gradient-to-b from-paper to-canvas">
                {focus.image ? (
                  <Image src={focus.image} alt="" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-contain p-6 mix-blend-multiply" />
                ) : (
                  <Icon name="fi-rr-box-open" className="absolute inset-0 m-auto size-fit text-5xl text-ink-3" />
                )}
              </div>
              <div className="border-t border-line p-5 md:p-6">
                <p className="label">{intent === 'demo' ? 'Demonstration of' : 'Quote for'}</p>
                <p className="mt-2 text-xl font-semibold leading-snug tracking-[-0.01em] text-ink">{focus.name}</p>
                <p className="mt-1 text-sm text-ink-3">{focus.brand}{focus.category ? ` · ${focus.category}` : ''}</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                  <Link href={`/products/${focus.slug}`} className="flex items-center gap-1 text-brand-700 hover:text-brand-600">View product <Icon name="fi-rr-arrow-small-right" /></Link>
                  <Link href="/products" className="text-ink-3 hover:text-ink">Choose another machine</Link>
                </div>
              </div>
            </div>
          )}
          <p className="mt-6 max-w-sm font-light leading-relaxed text-ink-3">
            {focus
              ? 'This machine is already in your request. Confirm the details in five short steps; our sales engineers reply within one business day.'
              : 'Five short steps. Your request goes straight to our sales engineers, and you’ll hear back within one business day.'}
          </p>
        </aside>
        <ProcurementFlow
          key={product ?? 'none'}
          options={options}
          initial={{ intent: intent === 'demo' ? 'demo' : 'quote', equipment: preselected, ...(department ? { department } : {}), ...(notes ? { notes } : {}) }}
        />
      </div>
    </div>
  );
}
