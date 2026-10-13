import { equipment } from '@/data/equipment';
import { getArticles, getEvents, getProducts } from '@/lib/data';

/** One search result: where it goes, what it is, and a line about it. */
export type SiteHit = { href: string; title: string; text: string; image?: string };
export type SiteResults = { label: string; hits: SiteHit[] }[];

/** The site's pages, with the words people might search them by. */
const pages: (SiteHit & { words: string })[] = [
  { href: '/about', title: 'About Us', text: 'Our story, mission, values and our CEO.', words: 'company history mission vision values ceo leadership team kenney' },
  { href: '/awards', title: 'Awards', text: 'No.1 in Healthcare and Ghana Club 100 recognition.', words: 'awards recognition ghana club 100 best healthcare' },
  { href: '/services', title: 'Products & Services', text: 'The equipment we supply and the services around it.', words: 'products services equipment solutions catalogue imaging laboratory' },
  { href: '/products', title: 'Shop', text: 'Browse the catalogue and request a quote.', words: 'shop buy price catalogue store order' },
  { href: '/events', title: 'Events & Activities', text: 'Upcoming events, news and press.', words: 'events activities news blog press media floke praise' },
  { href: '/esg', title: 'CSR', text: 'Our corporate social responsibility and community work.', words: 'csr esg community social responsibility donations outreach' },
  { href: '/support', title: 'Technical Support', text: 'Installation, maintenance, troubleshooting and repairs. Report a fault.', words: 'support help contact fault repair maintenance installation calibration engineer phone email whatsapp' },
  { href: '/quote', title: 'Request a quote', text: 'Tell us what you need and get a quotation.', words: 'quote quotation price request' },
  { href: '/portal', title: 'Client portal', text: 'Log faults and follow your service requests.', words: 'portal login sign in account client dashboard' },
];

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** Every word of the query must appear; words in the title count for more. */
function score(terms: string[], title: string, body: string) {
  const t = norm(title);
  const b = norm(body);
  let n = 0;
  for (const term of terms) {
    if (t.includes(term)) n += 3;
    else if (b.includes(term)) n += 1;
    else return 0;
  }
  return n;
}

function rank<T>(items: T[], terms: string[], fields: (x: T) => [string, string], toHit: (x: T) => SiteHit, max: number) {
  return items
    .map((x) => ({ x, s: score(terms, ...fields(x)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map((r) => toHit(r.x));
}

/** Search across the pages, the equipment, the shop, news and events. */
export async function searchSite(query: string): Promise<SiteResults> {
  const terms = norm(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const [products, articles, events] = await Promise.all([getProducts(), getArticles(), getEvents()]);

  return [
    { label: 'Pages', hits: rank(pages, terms, (p) => [p.title, `${p.text} ${p.words}`], ({ href, title, text }) => ({ href, title, text }), 6) },
    {
      label: 'Equipment',
      hits: rank(equipment, terms, (e) => [e.title, `${e.group} ${e.text}`], (e) => ({ href: '/services#equipment', title: e.title, text: e.group, image: e.image }), 8),
    },
    {
      label: 'Shop',
      hits: rank(
        products,
        terms,
        (p) => [p.name, [p.category, p.summary, ...(p.types ?? []), ...p.tags].join(' ')],
        (p) => ({ href: `/products/${p.slug}`, title: p.name, text: p.summary, image: p.image }),
        12,
      ),
    },
    {
      label: 'News',
      hits: rank(articles, terms, (a) => [a.title, `${a.excerpt} ${a.categories.join(' ')}`], (a) => ({ href: `/news/${a.slug}`, title: a.title, text: a.excerpt, image: a.image?.src }), 6),
    },
    {
      label: 'Events',
      hits: rank(events, terms, (e) => [e.title, `${e.venue} ${e.body} ${e.theme ?? ''}`], (e) => ({ href: `/events/${e.id}`, title: e.title, text: `${e.venue} · ${e.time}` }), 4),
    },
  ].filter((g) => g.hits.length);
}
