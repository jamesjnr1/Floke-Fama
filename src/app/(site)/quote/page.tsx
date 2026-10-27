import { redirect } from 'next/navigation';
import { getProducts } from '@/lib/data';
import { helpHref, orderHref } from '@/lib/links';

/**
 * The old quote form's address. Ordering is now the cart and checkout, and demonstrations, documents and "can't find
 * it" are requests on the Support page, so links and bookmarks to /quote land in the right place.
 */
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ intent?: string; product?: string; products?: string; need?: string; docs?: string }> }) {
  const [{ intent, product, products: list, need, docs }, products] = await Promise.all([searchParams, getProducts()]);
  const chosen = products.find((p) => p.slug === product);
  if (intent === 'demo') redirect(helpHref('demo', { equipment: chosen?.name }));
  if (docs && chosen) redirect(helpHref('documents', { equipment: chosen.name, message: `Please send the datasheet for the ${chosen.name}.` }));
  if (need?.trim()) redirect(helpHref('other', { message: `I'm looking for: ${need.trim().slice(0, 200)}` }));
  const slugs = [product, ...(list ?? '').split(',')].map((s) => s?.trim()).filter((s): s is string => Boolean(s) && products.some((p) => p.slug === s));
  redirect(slugs.length ? orderHref(...new Set(slugs)) : '/products');
}
