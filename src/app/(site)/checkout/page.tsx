import type { Metadata } from 'next';
import { Checkout } from '@/components/sales/checkout';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="bg-canvas pb-20 pt-32 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1180px] px-5 md:px-10">
        <h1 className="text-[clamp(2rem,1.4rem+2vw,3rem)] font-bold tracking-[-0.03em] text-ink">Checkout</h1>
        <p className="mb-8 mt-2 text-ink-3">Confirm your details and pay securely. Our team arranges delivery, installation and training.</p>
        <Checkout />
      </div>
    </div>
  );
}
