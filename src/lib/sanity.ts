import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';

/** Null when Sanity is not configured, so callers fall back to seed data. */
export const sanity: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2025-01-01',
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined,
      perspective: 'published',
    })
  : null;

const productFields = `
  "slug": slug.current, name, brand, "category": category->slug.current, summary,
  "image": image.asset->url, highlights, specs[]{label, value}, specsVerified,
  compatibility[]{item, status, note}, documents[]{title, kind, "url": file.asset->url},
  tags, featured, newArrival
`;

export const queries = {
  categories: `*[_type == "category"] | order(order asc){ "slug": slug.current, title, short, description, icon }`,
  products: `*[_type == "product"] | order(featured desc, name asc){ ${productFields} }`,
  product: `*[_type == "product" && slug.current == $slug][0]{ ${productFields} }`,
  metrics: `*[_type == "metric"] | order(order asc){ label, value, prefix, suffix, caption }`,
  milestones: `*[_type == "milestone"] | order(order asc){ "id": _id, kicker, title, body, date, "image": image.asset->url, icon, href }`,
};
