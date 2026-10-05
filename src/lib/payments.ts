/**
 * Payments: the single place the checkout hands an order to the payment platform.
 * No provider is connected yet. When Flokefama chooses one (e.g. Paystack or Hubtel, which both take
 * Mobile Money and cards in Ghana), `startPayment` creates the payment with the provider's API and returns
 * the URL of its secure payment page; the checkout already redirects there.
 */
export type PaymentMethod = 'momo' | 'card' | 'bank';

export interface CheckoutOrder {
  reference: string;
  items: { slug: string; name: string; qty: number }[];
  customer: { name: string; organisation: string; phone: string; email: string; region: string; address: string };
  method: PaymentMethod;
  momo?: { network: string; number: string };
}

export type PaymentResult = { status: 'redirect'; url: string } | { status: 'not-configured' };

export const paymentsConfigured = Boolean(process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER);

export async function startPayment(order: CheckoutOrder): Promise<PaymentResult> {
  if (!paymentsConfigured) return { status: 'not-configured' };
  // Provider integration goes here: create the payment for `order` and return its hosted payment URL.
  void order;
  return { status: 'not-configured' };
}

export const orderReference = () => `FF-${Date.now().toString(36).slice(-6).toUpperCase()}`;
