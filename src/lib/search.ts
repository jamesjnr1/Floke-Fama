import type { Product } from '@/lib/types';

/**
 * Product search. Uses Algolia when NEXT_PUBLIC_ALGOLIA_* is configured (instant, typo-tolerant
 * search across thousands of SKUs); otherwise a local in-memory scorer so the catalogue works
 * with zero configuration.
 */
export interface SearchHit {
  slug: string;
}

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID?.trim();
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY?.trim();
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX?.trim() || 'products';

export const searchProvider = appId && apiKey ? 'algolia' : 'local';

type LiteClient = { search: (req: unknown) => Promise<{ results: { hits?: SearchHit[] }[] }> };
let client: Promise<LiteClient> | null = null;

export async function searchProducts(query: string, category: string | null, all: Product[]): Promise<string[]> {
  const q = query.trim();
  if (!q) return all.filter((p) => !category || p.category === category).map((p) => p.slug);

  if (searchProvider === 'algolia') {
    client ??= import('algoliasearch/lite').then(({ liteClient }) => liteClient(appId!, apiKey!) as unknown as LiteClient);
    const { results } = await (await client).search({
      requests: [{ indexName, query: q, hitsPerPage: 50, filters: category ? `category:"${category}"` : undefined }],
    });
    return (results[0]?.hits ?? []).map((h) => h.slug);
  }

  return localSearch(q, category, all);
}

export function localSearch(query: string, category: string | null, all: Product[]): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return all
    .filter((p) => !category || p.category === category)
    .map((p) => {
      const name = `${p.brand} ${p.name}`.toLowerCase();
      const body = [p.summary, ...p.tags, ...p.highlights, ...p.specs.map((s) => s.value)].join(' ').toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (name.includes(t)) score += 3;
        else if (body.includes(t)) score += 1;
        else return { slug: p.slug, score: -1 };
      }
      return { slug: p.slug, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.slug);
}
