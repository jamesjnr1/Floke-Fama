import 'server-only';
import { cache } from 'react';
import { articles as seedArticles, type Article } from '@/data/articles';
import * as seed from '@/data/seed';
import { queries, sanity } from '@/lib/sanity';
import type { Category, EventItem, Metric, Milestone, Product } from '@/lib/types';

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

export const getCategories = cache(() => fromCms<Category[]>(queries.categories, seed.categories));
export const getProducts = cache(() => fromCms<Product[]>(queries.products, seed.products));
export const getMetrics = cache(() => fromCms<Metric[]>(queries.metrics, seed.metrics));
/** News, Blog & Press, newest first. */
export const getArticles = cache(() => fromCms<Article[]>(queries.articles, seedArticles));

/** Events, newest first. */
export const getEvents = cache(() => fromCms<EventItem[]>(queries.events, seed.events));
export const getMilestones = cache(() => fromCms<Milestone[]>(queries.milestones, seed.milestones));

export const getProduct = cache(async (slug: string) => {
  const fallback = seed.products.find((p) => p.slug === slug) ?? null;
  return fromCms<Product | null>(queries.product, fallback, { slug });
});
