import type { Metadata } from 'next';
import { ProcurementFlow } from '@/components/quote/procurement-flow';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { getCategories, getProducts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Request a Quote or Demonstration',
  description: 'Tell us your department, equipment and timeline. A Flokefama specialist replies within one business day.',
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ intent?: string; product?: string; need?: string }> }) {
  const [{ intent, product, need }, products, categories] = await Promise.all([searchParams, getProducts(), getCategories()]);
  const options = products.map((p) => ({ slug: p.slug, label: `${p.brand === 'Flokefama Select' ? '' : `${p.brand} `}${p.name}`, group: categories.find((c) => c.slug === p.category)?.title ?? 'Other' }));
  const preselected = [options.find((o) => o.slug === product)?.label, need?.trim()].filter((x): x is string => Boolean(x));

  return (
    <div className="bg-canvas pt-20">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">Procurement portal</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+3.5vw,4.5rem)]">Tell us what your facility needs.</h1>
          <p className="mt-6 max-w-sm font-light leading-relaxed text-ink-3">
            Four short steps. Your request goes straight to our sales engineers, and you’ll hear back within one business day.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              ['fi-rr-shield-check', 'Official distributor pricing and warranty'],
              ['fi-rr-settings', 'Installation, training and calibration included in proposals'],
              ['fi-rr-marker', 'Six branches for fast on-site support'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-ink-2"><Icon name={icon} className="text-brand-600" /> {text}</li>
            ))}
          </ul>
          <a href={contact.phoneHref} className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-ink">
            <Icon name="fi-rr-phone-call" className="text-brand-600" /> Prefer to talk? {contact.phone}
          </a>
        </aside>
        <ProcurementFlow options={options} initial={{ intent: intent === 'demo' ? 'demo' : 'quote', equipment: preselected }} />
      </div>
    </div>
  );
}
