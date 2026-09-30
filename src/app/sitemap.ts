import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data';
import { siteUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    ...['solutions', 'partners', 'impact', 'media'].map((p) => ({ url: `${siteUrl}/${p}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${siteUrl}/quote`, changeFrequency: 'monthly', priority: 0.8 },
    ...products.map((p) => ({ url: `${siteUrl}/products/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
