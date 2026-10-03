import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProcurementFlow } from '@/components/quote/procurement-flow';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
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

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ intent?: string; product?: string; products?: string; need?: string; docs?: string }> }) {
  const [{ intent, product, products: listParam, need, docs }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  const options = products.map((p) => ({ slug: p.slug, label: `${p.brand === 'Flokefama Select' ? '' : `${p.brand} `}${p.name}`, group: categories.find((c) => c.slug === p.category)?.title ?? 'Other' }));
  // From the quote list: several products in one request
  const listed = (listParam ?? '').split(',').map((s) => products.find((p) => p.slug === s.trim())).filter((p): p is (typeof products)[number] => Boolean(p)).slice(0, 30);
  const preselected = [...new Set([options.find((o) => o.slug === product)?.label, ...listed.map((p) => options.find((o) => o.slug === p.slug)?.label), need?.trim()].filter((x): x is string => Boolean(x)))];
  const listDepartments = [...new Set(listed.map((p) => departmentFor[p.category]).filter(Boolean))];
  // Coming from a product page: quote for that machine, with its department chosen from its category
  const chosen = products.find((p) => p.slug === product);
  const focus = chosen && { slug: chosen.slug, name: chosen.name, brand: chosen.brand, image: chosen.image, label: options.find((o) => o.slug === chosen.slug)!.label, category: categories.find((c) => c.slug === chosen.category)?.title };
  const department = chosen ? departmentFor[chosen.category] : listDepartments.length === 1 ? listDepartments[0] : undefined;
  const notes = chosen && docs ? `Please send the datasheet for the ${chosen.name}.` : undefined;

  return (
    <div className="bg-canvas pt-20">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">{intent === 'demo' ? 'Demonstration' : 'Request a quote'}</p>
          <h1 className="display mt-4 text-[clamp(2rem,1.4rem+2vw,3rem)] leading-[1.1]">
            {focus ? (intent === 'demo' ? 'Book a demonstration' : 'Request a quote') : listed.length ? `Quote for ${listed.length} ${listed.length === 1 ? 'item' : 'items'}` : 'Tell us what you need'}
          </h1>
          <p className="mt-4 max-w-sm text-lg leading-relaxed text-ink-2">Fill in the form and a sales engineer will reply within one business day.</p>
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
                  <Link href={`/products/${focus.slug}`} className="flex items-center gap-1 text-brand-700 hover:text-brand-600">View product</Link>
                  <Link href="/products" className="text-ink-3 hover:text-ink">Choose another machine</Link>
                </div>
              </div>
            </div>
          )}
          {!focus && listed.length > 0 && (
            <ul className="mt-8 divide-y divide-line overflow-hidden rounded-4xl border border-line bg-paper" data-testid="quote-list-summary">
              {listed.map((p) => (
                <li key={p.slug} className="flex items-center gap-4 p-4">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-canvas">
                    {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1.5 mix-blend-multiply" />}
                  </span>
                  <span className="min-w-0">
                    <Link href={`/products/${p.slug}`} className="block truncate font-medium text-ink hover:text-brand-700">{p.name}</Link>
                    <span className="text-sm text-ink-3">{p.brand}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {/* What the buyer gets, in three plain lines */}
          <ul className="mt-8 max-w-sm space-y-4">
            {['A reply within one business day', 'A quote tailored to your facility', 'Installation, training and support'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-ink-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Icon name="fi-rr-check" className="text-sm" /></span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 max-w-sm border-t border-line pt-6">
            <p className="text-sm text-ink-3">Prefer to talk?</p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 font-medium">
              <a href={contact.phoneHref} className="text-ink hover:text-brand-700">{contact.phone}</a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-600">WhatsApp us</a>
            </div>
          </div>
        </aside>
        <ProcurementFlow
          key={product ?? listParam ?? 'none'}
          options={options}
          initial={{ intent: intent === 'demo' ? 'demo' : 'quote', equipment: preselected, ...(department ? { department } : {}), ...(notes ? { notes } : {}) }}
        />
      </div>
    </div>
  );
}
