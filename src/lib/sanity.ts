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
  tags, featured, newArrival, types, description, highlightsSource, source
`;

const runs = `runs[]{ t, b, i, href }`;
const articleFields = `
  "slug": slug.current, title, date, "categories": coalesce(categories, []), excerpt, source,
  "image": select(defined(cover.asset) => { "src": cover.asset->url, "alt": coalesce(cover.alt, title), "width": cover.asset->metadata.dimensions.width, "height": cover.asset->metadata.dimensions.height }),
  "blocks": blocks[]{
    _type == "heading" => { "type": "h", text },
    _type == "paragraph" => { "type": "p", ${runs} },
    _type == "quote" => { "type": "quote", ${runs} },
    _type == "list" => { "type": select(ordered == true => "ol", "ul"), "items": items[]{ ${runs} }.runs },
    _type == "figure" => { "type": "img", "src": asset->url, "alt": coalesce(alt, ""), "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
  }
`;

export const queries = {
  categories: `*[_type == "category"] | order(order asc){ "slug": slug.current, title, short, description, icon }`,
  products: `*[_type == "product"] | order(featured desc, name asc){ ${productFields} }`,
  product: `*[_type == "product" && slug.current == $slug][0]{ ${productFields} }`,
  metrics: `*[_type == "metric"] | order(order asc){ label, value, prefix, suffix, caption }`,
  events: `*[_type == "event"] | order(date desc){ "id": slug.current, title, date, start, end, time, venue, body, more, theme, guests, price, "image": image.asset->url, "imageWidth": image.asset->metadata.dimensions.width, "imageHeight": image.asset->metadata.dimensions.height, "alt": image.alt }`,
  // News: Sanity's blocks are mapped back to the site's own article format
  articles: `*[_type == "article"] | order(date desc){ ${articleFields} }`,
  milestones: `*[_type == "milestone"] | order(order asc){ "id": _id, kicker, title, body, date, "image": image.asset->url, icon, href }`,
};
