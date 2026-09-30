/**
 * Pushes the product catalogue to Algolia (reads Sanity when configured, else the seed).
 * Usage: ALGOLIA_ADMIN_KEY=... NEXT_PUBLIC_ALGOLIA_APP_ID=... npm run algolia:sync
 * Run after bulk catalogue changes, or wire it to a Sanity webhook for automatic sync.
 */
import { algoliasearch } from 'algoliasearch';
import { createClient } from '@sanity/client';
import { products as seedProducts } from '../src/data/seed.ts';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID?.trim();
const adminKey = process.env.ALGOLIA_ADMIN_KEY?.trim();
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX?.trim() || 'products';
if (!appId || !adminKey) {
  console.error('Set NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY first (see .env.example).');
  process.exit(1);
}

type Record = { slug: string; name: string; brand: string; category: string; summary: string; tags: string[]; specs: { label: string; value: string }[]; featured?: boolean };

async function loadProducts(): Promise<Record[]> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  if (!projectId) return seedProducts;
  const sanity = createClient({ projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production', apiVersion: '2025-01-01', useCdn: false });
  return sanity.fetch(`*[_type == "product"]{ "slug": slug.current, name, brand, "category": category->slug.current, summary, tags, specs, featured }`);
}

const products = await loadProducts();
const client = algoliasearch(appId, adminKey);
await client.setSettings({
  indexName,
  indexSettings: {
    searchableAttributes: ['name', 'brand', 'tags', 'summary', 'specs.value'],
    attributesForFaceting: ['filterOnly(category)', 'brand'],
    customRanking: ['desc(featured)'],
  },
});
await client.replaceAllObjects({ indexName, objects: products.map((p) => ({ objectID: p.slug, ...p })) });
console.log(`Synced ${products.length} products to Algolia index "${indexName}".`);
