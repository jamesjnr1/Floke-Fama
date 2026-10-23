import type { MetadataRoute } from 'next';
import { allowIndexing, siteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: block all crawling so this deployment never competes with the live site, except the admin
  // console's sign-in page, which may be indexed (the console behind it never is).
  if (!allowIndexing) return { rules: { userAgent: '*', allow: '/admin/login', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: ['/', '/admin/login'], disallow: ['/admin', '/portal', '/engineer', '/login', '/api/', '/offline'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
