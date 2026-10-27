import type { Metadata } from 'next';
import { Checkout } from '@/components/sales/checkout';
import { getProducts } from '@/lib/data';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

/** `?add=slug,slug` (from "Order now"): those products go into the cart. */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ add?: string }> }) {
  const { add } = await searchParams;
  const slugs = (add ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30);
  const products = slugs.length ? await getProducts() : [];
  const adding = slugs.flatMap((slug) => {
    const p = products.find((x) => x.slug === slug);
    return p ? [{ slug: p.slug, name: p.name, brand: p.brand, image: p.image }] : [];
  });
  return (
    <div className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <h1 className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold tracking-[-0.03em] text-ink">Checkout</h1>
        <p className="mb-8 mt-2 text-ink-3">Send your order and our sales team confirms the price and delivery within one business day. Installation and training are included.</p>
        <Checkout adding={adding} />
      </div>
    </div>
  );
}
