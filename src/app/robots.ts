import type { MetadataRoute } from 'next';
import { allowIndexing, siteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: block all crawling so this deployment never competes with the live site.
  if (!allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/portal', '/api/', '/offline'] }, sitemap: `${siteUrl}/sitemap.xml` };
}
