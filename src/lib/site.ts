import 'server-only';
import { cache } from 'react';
import { sanity } from '@/lib/sanity';
import { defaultSite, withDerived, type Award, type EsgPillar, type Faq, type Logo, type PageHeader, type PageKey, type SiteContent } from '@/lib/site-content';

const img = (f: string) => `"${f}": ${f}.asset->url, "${f}W": ${f}.asset->metadata.dimensions.width, "${f}H": ${f}.asset->metadata.dimensions.height`;
const header = (k: string) => `"${k}": pageHeaders.${k}{ title, highlight, lead, "image": image.asset->url }`;

const query = `*[_id == "siteContent"][0]{
  contact, branches[]{ name, detail },
  technologyPartners[]{ name, role, ${img('logo')} },
  clients[]{ name, role, ${img('logo')} },
  hero, testimonials[]{ quote, name, role },
  purpose[]{ label, icon, text }, coreValues[]{ title, icon, text }, servicesInBrief[]{ title, icon, text },
  whyChoose[]{ title, icon, body }, ceo,
  awards[]{ _key, title, year, body, alt, "image": image.asset->url },
  faqs[]{ q, a, linkLabel, linkHref },
  esgPillars[]{ label, icon, title, body, alt, "image": image.asset->url },
  "headers": { ${(['about', 'services', 'shop', 'events', 'awards', 'esg', 'contact'] as const).map(header).join(', ')} }
}`;

type RawLogo = { name?: string; role?: string; logo?: string; logoW?: number; logoH?: number };
type Raw = Partial<{
  contact: Partial<{ phone: string; info: string; sales: string; support: string; address: string; lat: number; lng: number; mapEmbed: string }>;
  branches: { name: string; detail: string }[];
  technologyPartners: RawLogo[];
  clients: RawLogo[];
  hero: Partial<SiteContent['hero']>;
  testimonials: SiteContent['testimonials'];
  purpose: SiteContent['purpose'];
  coreValues: SiteContent['coreValues'];
  servicesInBrief: SiteContent['servicesInBrief'];
  whyChoose: SiteContent['whyChoose'];
  ceo: Partial<SiteContent['ceo']>;
  awards: (Partial<Award> & { _key?: string })[];
  faqs: { q: string; a: string; linkLabel?: string; linkHref?: string }[];
  esgPillars: Partial<EsgPillar>[];
  headers: Partial<Record<PageKey, Partial<PageHeader> | null>>;
}>;

/** A list from Sanity when it has items, otherwise the built-in one. */
const list = <T,>(v: T[] | undefined | null, fallback: T[]) => (v && v.length ? v : fallback);
/** Drop empty values so they don't override the defaults. */
const clean = <T extends object>(o: T | null | undefined) => Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v !== null && v !== undefined && v !== '')) as Partial<T>;
const logos = (v: RawLogo[] | undefined, fallback: Logo[]): Logo[] =>
  list(
    v?.filter((x) => x.name).map((x) => ({ name: x.name!, role: x.role, logo: x.logo ?? null, w: x.logoW ?? 0, h: x.logoH ?? 0 })),
    fallback,
  );

function merge(raw: Raw | null): SiteContent {
  if (!raw) return defaultSite;
  const d = defaultSite;
  const c = { ...d.contact, ...clean(raw.contact) };
  const headers = Object.fromEntries(
    (Object.keys(d.pageHeaders) as PageKey[]).map((k) => {
      const h = clean(raw.headers?.[k]);
      // A new photo from the Studio is centred; the built-in ones keep their tuned crop.
      return [k, { ...d.pageHeaders[k], ...h, ...(h.image ? { position: '50% 40%' } : {}) }];
    }),
  ) as Record<PageKey, PageHeader>;
  return {
    ...withDerived(c, raw.contact?.mapEmbed || d.maps.embed),
    branches: list(raw.branches, d.branches),
    technologyPartners: logos(raw.technologyPartners, d.technologyPartners),
    clients: logos(raw.clients, d.clients),
    hero: { ...d.hero, ...clean(raw.hero) },
    testimonials: list(raw.testimonials, d.testimonials),
    purpose: list(raw.purpose, d.purpose),
    coreValues: list(raw.coreValues, d.coreValues),
    servicesInBrief: list(raw.servicesInBrief, d.servicesInBrief),
    whyChoose: list(raw.whyChoose, d.whyChoose),
    ceo: { ...d.ceo, ...clean(raw.ceo), bio: list(raw.ceo?.bio, d.ceo.bio) },
    awards: list(
      raw.awards?.filter((a) => a.title && a.image).map((a, i) => ({ id: a._key ?? `award-${i}`, title: a.title!, body: a.body ?? '', year: a.year ?? '', image: a.image!, alt: a.alt ?? a.title! })),
      d.awards,
    ),
    faqs: list(
      raw.faqs?.filter((f) => f.q && f.a).map((f): Faq => ({ q: f.q, a: f.a, ...(f.linkHref && f.linkLabel ? { link: { href: f.linkHref, label: f.linkLabel } } : {}) })),
      d.faqs,
    ),
    esgPillars: list(
      raw.esgPillars?.filter((p) => p.title && p.image).map((p) => ({ label: p.label ?? '', icon: p.icon ?? 'fi-rr-badge-check', title: p.title!, body: p.body ?? '', image: p.image!, alt: p.alt ?? p.title! })),
      d.esgPillars,
    ),
    pageHeaders: headers,
  };
}

/**
 * Site content for this request: Sanity's "Site content" document merged over the built-in content, so an
 * empty field in the Studio never blanks the website. Refreshed with the rest of the CMS (webhook / 10 min).
 */
export const getSite = cache(async (): Promise<SiteContent> => {
  if (!sanity) return defaultSite;
  try {
    const raw = await sanity.fetch<Raw | null>(query, {}, { next: { revalidate: 600, tags: ['cms'] } });
    return merge(raw);
  } catch (error) {
    console.error('[cms] site content: falling back to built-in content:', error);
    return defaultSite;
  }
});
