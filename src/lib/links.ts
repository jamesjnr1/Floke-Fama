/**
 * Where the site's buying and help buttons go. There is one way to order: the cart and checkout ("Order now" puts
 * the product in the cart). Demonstrations, training, documents and "can't find it" are requests on the Support page.
 */

/** Checkout with these products added to the cart. */
export const orderHref = (...slugs: string[]) => `/checkout?add=${slugs.map(encodeURIComponent).join(',')}`;

export type HelpTopic = 'demo' | 'training' | 'documents' | 'parts' | 'other';

/** The Support page's "Other assistance" form, with the topic chosen and the equipment or message filled in. */
export function helpHref(topic: HelpTopic, fill: { equipment?: string; message?: string } = {}) {
  const q = new URLSearchParams({ type: 'assistance', topic });
  if (fill.equipment) q.set('equipment', fill.equipment);
  if (fill.message) q.set('message', fill.message);
  return `/support?${q}#request`;
}
