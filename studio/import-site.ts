/**
 * Creates the "Site content" document from the website's built-in content (src/lib/site-content.ts): contact
 * details, branches, logos, home, about, services, awards, FAQ, ESG and page headers, with their photos.
 *
 *   cd studio && SANITY_STUDIO_PROJECT_ID=<id> npm run import-site
 *
 * It only writes the Site content document; products, events and articles are left as they are.
 * Running it again resets Site content to the built-in text.
 */
import { createReadStream, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { getCliClient } from 'sanity/cli';
import { defaultSite } from '../src/lib/site-content';

const client = getCliClient({ apiVersion: '2025-01-01' });
const publicDir = join(process.cwd(), '..', 'public');

const cache = new Map<string, string>();
async function image(path?: string | null) {
  if (!path) return undefined;
  let ref = cache.get(path);
  if (!ref) {
    const file = join(publicDir, path);
    if (!existsSync(file)) {
      console.warn(`  missing ${path}`);
      return undefined;
    }
    ref = (await client.assets.upload('image', createReadStream(file), { filename: basename(file) }))._id;
    cache.set(path, ref);
  }
  return { _type: 'image', asset: { _type: 'reference', _ref: ref } };
}

let n = 0;
const k = () => `k${(n++).toString(36)}`;
const keyed = <T extends object>(items: T[], type: string) => items.map((x) => ({ _key: k(), _type: type, ...x }));

async function main() {
  const s = defaultSite;
  const { phoneHref: _p, whatsapp: _w, ...contact } = s.contact;
  console.log('Uploading logos, award photos, ESG photos and header photos…');
  const logos = async (items: typeof s.clients, type: string) =>
    Promise.all(items.map(async (l) => ({ _key: k(), _type: type, name: l.name, ...(l.role ? { role: l.role } : {}), logo: await image(l.logo) })));

  const headers: Record<string, unknown> = {};
  for (const [key, h] of Object.entries(s.pageHeaders)) {
    headers[key] = { title: h.title, highlight: h.highlight, lead: h.lead, image: await image(h.image) };
  }

  const doc = {
    _id: 'siteContent',
    _type: 'siteContent',
    contact: { ...contact, mapEmbed: s.maps.embed },
    branches: keyed(s.branches, 'branch'),
    technologyPartners: await logos(s.technologyPartners, 'partner'),
    clients: await logos(s.clients, 'client'),
    hero: s.hero,
    testimonials: keyed(s.testimonials, 'testimonial'),
    purpose: keyed(s.purpose, 'statement'),
    coreValues: keyed(s.coreValues, 'value'),
    servicesInBrief: keyed(s.servicesInBrief, 'service'),
    ceo: s.ceo,
    whyChoose: keyed(s.whyChoose, 'reason'),
    awards: await Promise.all(s.awards.map(async (a) => ({ _key: a.id, _type: 'award', title: a.title, year: a.year, body: a.body, alt: a.alt, image: await image(a.image) }))),
    faqs: keyed(s.faqs.map((f) => ({ q: f.q, a: f.a, ...(f.link ? { linkLabel: f.link.label, linkHref: f.link.href } : {}) })), 'faq'),
    esgPillars: await Promise.all(s.esgPillars.map(async (p) => ({ _key: k(), _type: 'pillar', label: p.label, icon: p.icon, title: p.title, body: p.body, alt: p.alt, image: await image(p.image) }))),
    pageHeaders: headers,
  };
  await client.createOrReplace(doc);
  console.log('Site content imported. Open the Studio → Site content.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
