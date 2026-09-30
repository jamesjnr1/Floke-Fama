/**
 * One-off import of the web app's seed content (src/data/seed.ts) into Sanity.
 * Run from /studio:  SANITY_STUDIO_PROJECT_ID=xxx npm run import-seed
 * Images are not uploaded; attach real product photography in the Studio afterwards.
 */
import { getCliClient } from 'sanity/cli';
import { categories, metrics, milestones, products } from '../src/data/seed';

const client = getCliClient({ apiVersion: '2025-01-01' });

const tx = client.transaction();
categories.forEach((c, i) => tx.createOrReplace({ _id: `category-${c.slug}`, _type: 'category', ...c, slug: { _type: 'slug', current: c.slug }, order: i }));
products.forEach(({ image: _image, documents, ...p }) =>
  tx.createOrReplace({
    _id: `product-${p.slug}`,
    _type: 'product',
    ...p,
    slug: { _type: 'slug', current: p.slug },
    category: { _type: 'reference', _ref: `category-${p.category}` },
    specs: p.specs.map((s, i) => ({ _key: `s${i}`, ...s })),
    compatibility: p.compatibility?.map((c, i) => ({ _key: `c${i}`, ...c })),
    highlights: p.highlights,
    documents: documents.map((d, i) => ({ _key: `d${i}`, title: d.title, kind: d.kind })),
  }),
);
metrics.forEach((m, i) => tx.createOrReplace({ _id: `metric-${i}`, _type: 'metric', ...m, order: i }));
milestones.forEach(({ image: _image, ...m }, i) => tx.createOrReplace({ _id: `milestone-${m.id}`, _type: 'milestone', ...m, order: i }));

tx.commit().then((r) => console.log(`Imported ${r.results.length} documents`));
