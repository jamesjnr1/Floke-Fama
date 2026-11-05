/**
 * Payments: the single place the checkout hands an order to the payment platform.
 * No provider is connected yet. When Flokefama chooses one (e.g. Paystack or Hubtel, which both take
 * Mobile Money and cards in Ghana), `startPayment` creates the payment with the provider's API and returns
 * the URL of its secure payment page; the checkout already redirects there.
 */
/** 'quote': the shop works on quotes, so payment is agreed with sales after the quote. The others are older orders. */
export type PaymentMethod = 'quote' | 'momo' | 'card' | 'bank';

export interface CheckoutOrder {
  reference: string;
  items: { slug: string; name: string; qty: number }[];
  customer: { name: string; organisation: string; phone: string; email: string; region: string; address: string };
  method: PaymentMethod;
  momo?: { network: string; number: string };
  /** What it is for: the department, how soon it is needed (sets its priority for sales) and any notes. */
  needs?: { department: string; timeline: string; notes: string };
}

export type PaymentResult = { status: 'redirect'; url: string } | { status: 'not-configured' };

/**
 * Providers whose integration is written in `startPayment`. None yet: until one is, setting
 * NEXT_PUBLIC_PAYMENTS_PROVIDER changes nothing, so the checkout never says “Make payment” without taking one.
 */
const implemented: string[] = [];
export const paymentsConfigured = implemented.includes((process.env.NEXT_PUBLIC_PAYMENTS_PROVIDER ?? '').trim().toLowerCase());

export async function startPayment(order: CheckoutOrder): Promise<PaymentResult> {
  if (!paymentsConfigured) return { status: 'not-configured' };
  // Provider integration goes here: create the payment for `order` and return its hosted payment URL.
  void order;
  return { status: 'not-configured' };
}

export const orderReference = () => `FF-${Date.now().toString(36).slice(-6).toUpperCase()}`;
