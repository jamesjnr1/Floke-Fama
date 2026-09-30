import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Origin of THIS deployment, used for canonical URLs, the sitemap and structured data.
 *
 * It deliberately never defaults to the live flokefama.com: the new site runs on its own
 * preview address until Flokefama approves a launch, and must not point search engines at,
 * or otherwise interfere with, the live WordPress site.
 * Resolution: NEXT_PUBLIC_SITE_URL → Vercel's production URL → Vercel deployment URL → localhost.
 * Tolerates empty values, a missing protocol and trailing slashes.
 */
export const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL,
  'http://localhost:3000',
);

/**
 * Launch switch. Search engines are blocked (robots.txt, meta robots and X-Robots-Tag) unless
 * this is exactly "true", so the preview can never compete with the live site in search results.
 * Only set it when Flokefama has approved going live.
 */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

function normalizeUrl(value: string | undefined, fallback: string): string {
  const raw = value?.trim();
  if (!raw) return fallback;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    console.warn(`[config] Ignoring invalid NEXT_PUBLIC_SITE_URL "${raw}"; using ${fallback}`);
    return fallback;
  }
}
