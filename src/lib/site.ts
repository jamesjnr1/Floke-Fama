import 'server-only';
import { cache } from 'react';
import { sanity } from '@/lib/sanity';
import { namedHospitals, visibleBrands } from '@/data/seed';
import { defaultSite, withDerived, type Award, type EsgPillar, type EventAlbum, type Faq, type HeroMedia, type Logo, type PageHeader, type PageKey, type Photo, type SiteContent, type Solution } from '@/lib/site-content';

const img = (f: string) => `"${f}": ${f}.asset->url, "${f}W": ${f}.asset->metadata.dimensions.width, "${f}H": ${f}.asset->metadata.dimensions.height`;
const header = (k: string) => `"${k}": pageHeaders.${k}{ title, highlight, emphasisFirst, lead, "image": image.asset->url }`;

const query = `*[_id == "siteContent"][0]{
  contact, branches[]{ name, detail, phone },
  technologyPartners[]{ name, role, ${img('logo')} },
  clients[]{ name, role, code, kind, ${img('logo')} },
  hero, testimonials[]{ quote, name, role },
  signInPhones[]{ label, phone },
  heroMedia[]{ caption, label, "image": image.asset->url, "video": video.asset->url }, heroMediaOnly,
  solutions{ kicker, title, highlight, lead, items[]{ title, body, points, href, alt, fit, "image": image.asset->url } },
  engineering{ title, lead, photos[]{ alt, caption, "src": asset->url } },
  "photos": { "whatWeDo": photoWhatWeDo.asset->url, "office": photoOffice.asset->url, "ceo": photoCeo.asset->url },
  eventAlbums[]{ title, date, photos[]{ alt, caption, "src": asset->url } },
  purpose[]{ label, icon, text }, coreValues[]{ title, icon, text }, servicesInBrief[]{ title, icon, text },
  whyChoose[]{ title, icon, body },
  awards[]{ _key, title, year, body, alt, "image": image.asset->url },
  faqs[]{ q, a, linkLabel, linkHref },
  esgPillars[]{ label, icon, title, body, alt, "image": image.asset->url },
  "headers": { ${(['about', 'services', 'shop', 'events', 'awards', 'esg', 'contact'] as const).map(header).join(', ')} }
}`;

type RawLogo = { name?: string; role?: string; code?: string; kind?: string; logo?: string; logoW?: number; logoH?: number };
type RawPhoto = { src?: string; alt?: string; caption?: string };
type Raw = Partial<{
  contact: Partial<{ phone: string; info: string; sales: string; support: string; address: string; lat: number; lng: number; mapEmbed: string }>;
  branches: { name: string; detail: string; phone?: string }[];
  technologyPartners: RawLogo[];
  clients: RawLogo[];
  hero: Partial<SiteContent['hero']>;
  signInPhones: { label?: string; phone?: string }[];
  heroMedia: { caption?: string; label?: string; image?: string; video?: string }[];
  heroMediaOnly: boolean;
  photos: { whatWeDo?: string; office?: string; ceo?: string };
  solutions: Partial<Omit<SiteContent['solutions'], 'items'>> & { items?: (Partial<Solution> & { fit?: string })[] };
  engineering: { title?: string; lead?: string; photos?: RawPhoto[] };
  eventAlbums: { title?: string; date?: string; photos?: RawPhoto[] }[];
  testimonials: SiteContent['testimonials'];
  purpose: SiteContent['purpose'];
  coreValues: SiteContent['coreValues'];
  servicesInBrief: SiteContent['servicesInBrief'];
  whyChoose: SiteContent['whyChoose'];
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
    v?.filter((x) => x.name).map((x) => ({ name: x.name!, role: x.role, code: x.code, kind: x.kind, logo: x.logo ?? null, w: x.logoW ?? 0, h: x.logoH ?? 0 })),
    fallback,
  );

const photos = (v: RawPhoto[] | undefined): Photo[] => (v ?? []).filter((p) => p.src).map((p) => ({ src: p.src!, alt: p.alt || p.caption || 'Flokefama photo', caption: p.caption }));

/** Hospitals are never named on the website (the CEO, Oct 2026): a client's name, or a known one, becomes its code. */
const coded = (t: string, clients: Logo[]) =>
  [...clients.filter((c) => c.code).map((c): [RegExp, string] => [new RegExp(c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), `client hospital ${c.code}`]), ...namedHospitals].reduce((s, [re, code]) => s.replace(re, code), t);

/** Studio text written before the CEO's review still names the other distributors; show Mindray alone. */
const onlyMindray = (t: string) => t.replace(/Mindray,\s*Biozek Holland,?\s*and MR Global/g, 'Mindray');

function merge(raw: Raw | null): SiteContent {
  if (!raw) return defaultSite;
  const d = defaultSite;
  const c = { ...d.contact, ...clean(raw.contact) };
  const headers = Object.fromEntries(
    (Object.keys(d.pageHeaders) as PageKey[]).map((k) => {
      const h = clean(raw.headers?.[k]);
      // Wording the CEO has replaced (About: “Purveyor of excellence in healthcare” → “Saving Lives since 2008”) never comes back from older Studio text
      if (h.title && /purveyor of excellence/i.test(`${h.title} ${h.highlight ?? ''}`)) { delete h.title; delete h.highlight; }
      // A new photo from the Studio is centred; the built-in ones keep their tuned crop.
      // A header photo chosen in the code (lockImage) wins over a Studio photo; the Studio text still applies.
      if (d.pageHeaders[k].lockImage) return [k, { ...d.pageHeaders[k], ...h, image: d.pageHeaders[k].image, position: d.pageHeaders[k].position }];
      return [k, { ...d.pageHeaders[k], ...h, ...(h.image ? { position: '50% 40%' } : {}) }];
    }),
  ) as Record<PageKey, PageHeader>;
  return {
    ...withDerived(c, raw.contact?.mapEmbed || d.maps.embed),
    // A branch from the Studio without a phone keeps the built-in number for that branch
    branches: list(raw.branches, d.branches).map((b) => ({ ...b, phone: b.phone || d.branches.find((x) => x.name.toLowerCase().replace(/\W/g, '') === b.name.toLowerCase().replace(/\W/g, ''))?.phone })),
    // Only the brands the CEO wants visible (Mindray), even if the Studio still lists others
    technologyPartners: logos(raw.technologyPartners, d.technologyPartners).filter((p) => visibleBrands.includes(p.name)),
    // A client from the Studio without a code keeps the built-in code for that hospital, else gets one by its place
    clients: logos(raw.clients, d.clients).map((c, i) => ({ ...c, code: c.code || d.clients.find((x) => x.name === c.name)?.code || `FF-H${String(i + 1).padStart(2, '0')}`, kind: c.kind || d.clients.find((x) => x.name === c.name)?.kind })),
    hero: { ...d.hero, ...clean(raw.hero) },
    signInPhones: (raw.signInPhones ?? []).filter((p) => p.label && p.phone).map((p) => ({ label: p.label!, phone: p.phone! })),
    heroMedia: (raw.heroMedia ?? [])
      .filter((m) => m.caption && (m.image || m.video))
      .map((m): HeroMedia => (m.video ? { kind: 'video', src: m.video, poster: m.image, caption: m.caption!, label: m.label } : { kind: 'image', src: m.image!, caption: m.caption!, label: m.label })),
    heroMediaOnly: Boolean(raw.heroMediaOnly && raw.heroMedia?.length),
    solutions: {
      ...d.solutions,
      ...clean({ kicker: raw.solutions?.kicker, title: raw.solutions?.title, highlight: raw.solutions?.highlight, lead: raw.solutions?.lead }),
      items: list(
        raw.solutions?.items
          ?.filter((s) => s.title)
          .map((s): Solution => ({ title: s.title!, body: s.body ?? '', points: s.points ?? [], href: s.href || '/products', image: s.image, alt: s.alt || s.title, fit: s.fit === 'contain' ? 'contain' : 'cover' })),
        d.solutions.items,
      ),
    },
    engineering: { ...d.engineering, ...clean({ title: raw.engineering?.title, lead: raw.engineering?.lead }), photos: photos(raw.engineering?.photos) },
    eventAlbums: (raw.eventAlbums ?? []).map((a): EventAlbum => ({ title: a.title ?? '', date: a.date, photos: photos(a.photos) })).filter((a) => a.title && a.photos.length),
    testimonials: list(raw.testimonials, d.testimonials).map((t) => ({ ...t, role: coded(t.role ?? '', d.clients), quote: coded(t.quote ?? '', d.clients) })),
    purpose: list(raw.purpose, d.purpose),
    coreValues: list(raw.coreValues, d.coreValues),
    servicesInBrief: list(raw.servicesInBrief, d.servicesInBrief),
    whyChoose: list(raw.whyChoose, d.whyChoose).map((w) => ({ ...w, body: onlyMindray(w.body) })),
    // The CEO profile is the one the CEO supplied (Oct 2026); the older Studio text no longer replaces it
    ceo: { ...d.ceo, photo: raw.photos?.ceo || d.ceo.photo },
    photos: { ...d.photos, ...clean({ whatWeDo: raw.photos?.whatWeDo, office: raw.photos?.office }) },
    // The Studio's awards, then any built-in award the Studio doesn't list yet (matched by title)
    awards: list(
      raw.awards?.filter((a) => a.title && a.image).map((a, i) => ({ id: a._key ?? `award-${i}`, title: a.title!, body: a.body ?? '', year: a.year ?? '', image: a.image!, alt: a.alt ?? a.title! })),
      d.awards,
    ).concat(raw.awards?.some((a) => a.title && a.image) ? d.awards.filter((x) => !raw.awards!.some((a) => a.title?.trim().toLowerCase() === x.title.toLowerCase())) : []),
    faqs: list(
      raw.faqs?.filter((f) => f.q && f.a).map((f): Faq => ({ q: f.q, a: onlyMindray(f.a), ...(f.linkHref && f.linkLabel ? { link: { href: f.linkHref, label: f.linkLabel } } : {}) })),
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
