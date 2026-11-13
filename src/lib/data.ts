import 'server-only';
import { cache } from 'react';
import { articles as seedArticles, type Article } from '@/data/articles';
import * as seed from '@/data/seed';
import { queries, sanity } from '@/lib/sanity';
import type { Category, EventItem, Metric, Milestone, Product } from '@/lib/types';
import { leadRank } from '@/data/shop-lead';
import { categoryOf, newCategorySlugs, retiredCategorySlugs } from '@/lib/categories';
import { tidyProduct } from '@/lib/product-names';

/**
 * Content access layer. Reads from Sanity when configured, otherwise from the seed.
 * Pages are statically generated and revalidated every 10 minutes (ISR), so CMS edits
 * go live without a redeploy.
 */
export const revalidate = 600;

async function fromCms<T>(query: string, fallback: T, params: Record<string, string> = {}): Promise<T> {
  if (!sanity) return fallback;
  try {
    const result = await sanity.fetch<T>(query, params, { next: { revalidate, tags: ['cms'] } });
    return result ?? fallback;
  } catch (error) {
    console.error('[cms] falling back to seed data:', error);
    return fallback;
  }
}

/** The CEO's five categories; the Studio's list until it has been updated to them. */
export const getCategories = cache(async () => {
  const cms = await fromCms<Category[]>(queries.categories, seed.categories);
  // The earlier categories may still be in the Studio after the import; their products now sit in the new ones
  return newCategorySlugs.every((s) => cms.some((c) => c.slug === s)) ? cms.filter((c) => !retiredCategorySlugs.includes(c.slug)) : seed.categories;
});
const recategorise = (p: Product): Product => tidyProduct({ ...p, category: categoryOf(p.slug, p.category) });
// Featured first, then A to Z by the name as shown (the Studio sorts by its own names, some still in the old style)
export const getProducts = cache(async () =>
  (await fromCms<Product[]>(queries.products, seed.products)).map(recategorise).sort((a, b) => leadRank(a.slug) - leadRank(b.slug) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name, 'en', { numeric: true })),
);
export const getMetrics = cache(() => fromCms<Metric[]>(queries.metrics, seed.metrics));
/** News, Blog & Press, newest first. */
export const getArticles = cache(() => fromCms<Article[]>(queries.articles, seedArticles));

/** Events, newest first. */
/** Events from the Studio; an event with no cover or photos there yet keeps the ones added with the site (by its ID). */
export const getEvents = cache(async () => {
  const events = await fromCms<EventItem[]>(queries.events, seed.events);
  return events.map((e) => {
    const own = seed.events.find((x) => x.id === e.id);
    return { ...e, cover: e.cover || own?.cover || null, photos: e.photos?.length ? e.photos : (own?.photos ?? e.photos) };
  });
});
export const getMilestones = cache(() => fromCms<Milestone[]>(queries.milestones, seed.milestones));

export const getProduct = cache(async (slug: string) => {
  const fallback = seed.products.find((p) => p.slug === slug) ?? null;
  const p = await fromCms<Product | null>(queries.product, fallback, { slug });
  return p && recategorise(p);
});
