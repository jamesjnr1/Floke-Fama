/**
 * Loads the website's current content into Sanity, with images:
 * 6 categories, 92 products (photos), events (flyers), 8 news articles (covers and inline images),
 * metrics and milestones. Safe to run again: documents keep fixed IDs and are replaced, and images
 * are de-duplicated by Sanity.
 *
 * Run from /studio:  npm run import-seed
 * (needs SANITY_STUDIO_PROJECT_ID, and `npx sanity login` once)
 */
import { createReadStream, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { articles, type Run } from '../src/data/articles';
import { categories, events, metrics, milestones, products } from '../src/data/seed';

const client = getCliClient({ apiVersion: '2025-01-01' });
const publicDir = join(__dirname, '..', 'public');

const cache = new Map<string, string>();
/** Uploads a file from /public once and returns its asset ID (or undefined if it is missing). */
async function asset(path: string | undefined, kind: 'image' | 'file' = 'image') {
  if (!path) return undefined;
  if (cache.has(path)) return cache.get(path);
  const file = join(publicDir, path);
  if (!existsSync(file)) {
    console.warn(`  missing ${path}`);
    return undefined;
  }
  const doc = await client.assets.upload(kind, createReadStream(file), { filename: basename(file) });
  cache.set(path, doc._id);
  return doc._id;
}
const image = async (path?: string, alt?: string) => {
  const ref = await asset(path);
  return ref ? { _type: 'image', asset: { _type: 'reference', _ref: ref }, ...(alt ? { alt } : {}) } : undefined;
};

let key = 0;
const k = () => `k${(key++).toString(36)}`;
const runs = (rs: Run[]) => rs.map((r) => ({ _key: k(), _type: 'run', ...r }));

async function main() {
  const tx = client.transaction();

  categories.forEach((c, i) => tx.createOrReplace({ _id: `category-${c.slug}`, _type: 'category', ...c, slug: { _type: 'slug', current: c.slug }, order: i }));

  console.log(`Uploading ${products.length} product photos…`);
  for (const { image: img, documents, ...p } of products) {
    tx.createOrReplace({
      _id: `product-${p.slug}`,
      _type: 'product',
      ...p,
      image: await image(img),
      slug: { _type: 'slug', current: p.slug },
      category: { _type: 'reference', _ref: `category-${p.category}` },
      specs: p.specs.map((s) => ({ _key: k(), ...s })),
      compatibility: p.compatibility?.map((c) => ({ _key: k(), ...c })),
      documents: documents.map((d) => ({ _key: k(), title: d.title, kind: d.kind })),
    });
  }

  console.log(`Uploading ${events.length} event flyers…`);
  for (const { id, image: img, alt, imageWidth: _w, imageHeight: _h, ...e } of events) {
    tx.createOrReplace({ _id: `event-${id}`, _type: 'event', ...e, slug: { _type: 'slug', current: id }, image: await image(img, alt) });
  }

  console.log(`Uploading ${articles.length} news articles and their images…`);
  for (const a of articles) {
    const blocks = [];
    for (const b of a.blocks) {
      if (b.type === 'h') blocks.push({ _key: k(), _type: 'heading', text: b.text });
      else if (b.type === 'p') blocks.push({ _key: k(), _type: 'paragraph', runs: runs(b.runs) });
      else if (b.type === 'quote') blocks.push({ _key: k(), _type: 'quote', runs: runs(b.runs) });
      else if (b.type === 'ul' || b.type === 'ol') blocks.push({ _key: k(), _type: 'list', ordered: b.type === 'ol', items: b.items.map((it) => ({ _key: k(), _type: 'item', runs: runs(it) })) });
      else if (b.type === 'img') {
        const fig = await image(b.src, b.alt);
        if (fig) blocks.push({ _key: k(), ...fig, _type: 'figure' });
      }
    }
    tx.createOrReplace({
      _id: `article-${a.slug}`,
      _type: 'article',
      title: a.title,
      slug: { _type: 'slug', current: a.slug },
      date: a.date,
      categories: a.categories,
      excerpt: a.excerpt,
      cover: await image(a.image?.src, a.image?.alt),
      blocks,
      source: a.source,
    });
  }

  metrics.forEach((m, i) => tx.createOrReplace({ _id: `metric-${i}`, _type: 'metric', ...m, order: i }));
  for (const [i, { image: img, ...m }] of milestones.entries()) {
    tx.createOrReplace({ _id: `milestone-${m.id}`, _type: 'milestone', ...m, image: await image(img), order: i });
  }

  const r = await tx.commit();
  console.log(`Imported ${r.results.length} documents. Open the Studio to see them.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
