/**
 * Site-wide content the Flokefama team edits in Sanity (the "Site content" document): contact details,
 * branches, logos, home, about, services, awards, FAQ, ESG and the page headers. `defaultSite` is the built-in
 * content from src/data/seed.ts, used for anything Sanity leaves empty (and when Sanity isn't connected).
 * Shared by the server loader (lib/site.ts) and the browser (components/site-provider.tsx).
 */
import * as seed from '../data/seed';

export interface Contact {
  address: string;
  lat: number;
  lng: number;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  info: string;
  sales: string;
  support: string;
}
export interface Logo { name: string; logo: string | null; w: number; h: number; role?: string }
export interface Award { id: string; title: string; body: string; year: string; image: string; alt: string }
export interface Faq { q: string; a: string; link?: { href: string; label: string } }
export interface EsgPillar { label: string; icon: string; title: string; body: string; image: string; alt: string }
export interface PageHeader { title: string; highlight: string; lead: string; image?: string; position?: string; /** 'strong': a darker veil, for bright photos */ veil?: 'strong'; /** Keep this built-in photo even when a photo is set in the Studio */ lockImage?: boolean }
export type PageKey = 'about' | 'services' | 'shop' | 'events' | 'awards' | 'esg' | 'contact';

export interface SiteContent {
  contact: Contact;
  maps: { embed: string; directions: string; open: string };
  branches: { name: string; detail: string }[];
  technologyPartners: Logo[];
  clients: Logo[];
  hero: { title: string; highlight: string; lead: string };
  testimonials: { quote: string; name: string; role: string }[];
  purpose: { label: string; icon: string; text: string }[];
  coreValues: { title: string; icon: string; text: string }[];
  servicesInBrief: { icon: string; title: string; text: string }[];
  whyChoose: { icon: string; title: string; body: string }[];
  ceo: {
    name: string;
    role: string;
    bio: string[];
    education: { title: string; detail: string }[];
    honours: { title: string; detail: string }[];
    creed: string;
    purpose: string;
  };
  awards: Award[];
  faqs: Faq[];
  esgPillars: EsgPillar[];
  pageHeaders: Record<PageKey, PageHeader>;
}

/** Phone link, WhatsApp link and map links follow from the phone number and the coordinates. */
export function withDerived(c: Omit<Contact, 'phoneHref' | 'whatsapp'> & Partial<Pick<Contact, 'phoneHref' | 'whatsapp'>>, embed: string) {
  const digits = c.phone.replace(/\D/g, '');
  const contact: Contact = { ...c, phoneHref: `tel:+${digits}`, whatsapp: `https://wa.me/${digits}` };
  const maps = {
    embed,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving`,
    open: `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`,
  };
  return { contact, maps };
}

export const defaultFaqs: Faq[] = [] = [
  {
    q: 'How do I get a price?',
    a: 'Prices depend on the model, configuration, quantity and the service package you choose, so every order is quoted. Add products to your cart, or press “Order now” on any product. A specialist replies within one business day.',
    link: { href: '/quote', label: 'Order now' },
  },
  {
    q: 'Can I see the equipment working before I buy?',
    a: 'Yes. Book a demonstration from any product page and our applications team will arrange it at your facility.',
  },
  {
    q: 'Which brands do you supply?',
    a: 'Flokefama is the official distributor of Mindray, alongside other trusted manufacturers in the catalogue.',
  },
  {
    q: 'Do you install the equipment and train our staff?',
    a: 'Yes. We handle installation, calibration and training, then support you with maintenance, repairs and calibration for the life of the equipment.',
    link: { href: '/services', label: 'Our services' },
  },
  {
    q: 'How do we get service after installation?',
    a: 'Through the Flokefama client portal: request a service visit, follow the engineer’s progress and download calibration certificates. You can also call or message us on WhatsApp.',
    link: { href: '/login', label: 'Client portal' },
  },
  {
    q: 'Can you supply something that isn’t in the catalogue?',
    a: 'Often, yes. Our team sources beyond the catalogue: tell us what you need at checkout.',
  },
  {
    q: 'Where can we find you?',
    a: `Head office in Santa Maria, Accra, with branches at Korle-Bu, Okaishie, Kumasi, Aflao and Techiman. Call ${seed.contact.phone} or email ${seed.contact.sales}.`,
    link: { href: '/about#branches', label: 'Branches and directions' },
  },
];

export const defaultEsgPillars: EsgPillar[] = [
  {
    label: 'Social · Patient safety',
    icon: 'fi-rr-shield-check',
    title: 'Quality is tested, not assumed.',
    body: 'Analysers, reagents and IVD kits directly inform clinical decisions. We verify quality before delivery, because every result protects a patient.',
    image: '/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-cover.webp',
    alt: 'Flokefama specialists verifying analyser results with laboratory staff',
  },
  {
    label: 'Social · Community',
    icon: 'fi-rr-hand-holding-heart',
    title: 'Supporting the ZoDF Ramadan programme.',
    body: 'In March 2026 Flokefama supported the ZoDF Ramadan distribution programme, serving communities beyond the hospital walls.',
    image: '/images/news/flokefama-supports-zodf-ramadan-distribution-programme-cover.webp',
    alt: 'Flokefama presenting its donation to the Zongo Development Fund Ramadan programme',
  },
  {
    label: 'Social · Education',
    icon: 'fi-rr-graduation-cap',
    title: 'Shaping Ghana’s next biomedical engineers.',
    body: 'A partnership with the University of Ghana School of Engineering, alongside hands-on training and capacity building for clinical teams nationwide.',
    image: '/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-1.webp',
    alt: 'A Flokefama training session for clinical and laboratory teams',
  },
  {
    label: 'Governance',
    icon: 'fi-rr-badge-check',
    title: 'Honesty and integrity, on record.',
    body: 'Honesty and integrity guide every dealing. Flokefama is ranked among Ghana’s top companies in the Ghana Club 100 (Ghana Investment Promotion Centre), and our vision includes listing on the Ghana Stock Exchange by 2030.',
    image: '/images/awards/ghana-club-100-trophy.webp',
    alt: 'Flokefama’s Ghana Club 100 trophy, 21st edition',
  },
];

export const defaultPageHeaders: Record<PageKey, PageHeader> = {
  about: { title: 'Purveyor of excellence', highlight: 'in healthcare', lead: 'FLOKEFAMA is a multiple award-winning company and one of the most trusted medical equipment suppliers in Ghana.', image: '/images/headers/about-microscopes.webp', position: '40% 50%', veil: 'strong', lockImage: true },
  services: { title: 'We go beyond just supplying', highlight: 'medical equipment', lead: 'End-to-end solutions, from procurement and installation to training and maintenance.', image: '/images/headers/services-technician.webp', position: '50% 40%', veil: 'strong', lockImage: true },
  shop: { title: 'Clinical-grade equipment.', highlight: 'Instantly searchable.', lead: '{count} products for hospitals and laboratories, with installation, training and after-sales support on everything we supply.', image: '/images/headers/shop.webp', position: '50% 35%' },
  events: { title: 'Moments that', highlight: 'bring us together', lead: 'Celebrations, community programmes and industry events from across the Flokefama family.', image: '/images/headers/events-parade.webp', position: '50% 45%' },
  awards: { title: 'Recognitions that', highlight: 'reflect our impact', lead: 'Our commitment to excellence, innovation and service, recognized through prestigious awards and honors.', image: '/images/headers/awards-trophy.webp', position: '50% 45%' },
  esg: { title: 'Healthcare that', highlight: 'gives back', lead: 'Our corporate social responsibility: supporting healthcare institutions, developing professionals and serving communities across Ghana.', image: '/images/headers/esg-care.webp', position: '30% 60%', veil: 'strong', lockImage: true },
  contact: { title: 'Get in touch', highlight: 'with us', lead: 'We’re here to provide total healthcare solutions. Reach out to us anytime.', image: '/images/headers/contact-support.webp', position: '50% 30%' },
};

export const defaultSite: SiteContent = {
  ...withDerived(seed.contact, seed.maps.embed),
  branches: [...seed.branches],
  technologyPartners: seed.technologyPartners.map((x) => ({ ...x })),
  clients: seed.clients.map((x) => ({ ...x })),
  hero: { title: 'Ghana’s No.1', highlight: 'Healthcare Company', lead: 'Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.' },
  testimonials: [...seed.testimonials],
  purpose: seed.purpose.map((x) => ({ ...x })),
  coreValues: seed.coreValues.map((x) => ({ ...x })),
  servicesInBrief: seed.servicesInBrief.map((x) => ({ ...x })),
  // The original list repeated "High-quality, globally recognized medical brands"; keep each point once.
  whyChoose: seed.whyChoose.filter((x, i, all) => all.findIndex((y) => y.title === x.title) === i).map((x) => ({ ...x })),
  // The CEO profile as written by the CEO (Website Redesign Review, Oct 2026)
  ceo: {
    name: 'Emmanuel Teye Kwabena Kenney',
    role: 'Founder & Chief Executive Officer, Flokefama Company Limited',
    bio: [
      'Emmanuel Teye Kwabena Kenney is a transformational leader in African healthcare, dedicated to redefining diagnostic standards across the continent. As the Founder and CEO of FLOKEFAMA Company Limited, he has steered the company from a niche distributor to a dominant force in healthcare infrastructure. Driven by a mission to solve the “Impossible Triangle” of IVD (balancing Quality, Efficiency, and Cost), Teye is currently leading West Africa’s transition toward Total Laboratory Automation (TLA) and data-driven diagnostics.',
      'A scientist by training and a graduate of the Stanford Graduate School of Business, Teye’s leadership is rooted in a unique blend of technical expertise and strategic discipline. In early 2026, he delivered a landmark keynote at the Mindray Africa Division Distributor’s Congress in Kenya, where he shared Flokefama’s roadmap for building modern diagnostic ecosystems. His vision extends beyond selling equipment; he is building the physical and operational backbone of West African healthcare through central distribution warehouses, quality-controlled logistics, and a world-class engineering support network.',
    ],
    education: [
      { title: 'Stanford Graduate School of Business', detail: 'Certificate in Leadership and Business Growth' },
      { title: 'KNUST', detail: 'BSc in Sciences' },
      { title: 'Chartered Institute of Marketing, UK', detail: 'Postgraduate Certification' },
      { title: 'St. Augustine’s College (APSU 98)', detail: 'Proud alumnus and ongoing benefactor' },
    ],
    honours: [
      { title: 'Keynote Speaker', detail: 'Mindray Africa Division Distributor’s Congress, Kenya (2026)' },
      { title: 'CEO of the Year, Healthcare', detail: '9th Ghana CEO Summit' },
      { title: 'EMY Africa Man of the Year in Health (2024)', detail: 'Recognizing his systemic impact on Ghanaian healthcare' },
      { title: 'First-ever Honorary Member', detail: 'Ghana Association of Medical Laboratory Scientists (GAMLS)' },
      { title: 'Podcast Host', detail: '“Diagnostics & Beyond”, exploring the intersection of lab medicine and health-tech' },
    ],
    creed: 'Labour not to be rich but to be a blessing unto others.',
    purpose:
      'Guided by this creed, Teye’s commitment to saving lives is tangible. From renovating the Korle-Bu Blood Bank to donating critical care equipment like ventilators and incubators to the University of Ghana Medical Centre (UGMC) and The Trust Hospital, his impact is felt across Ghana’s healthcare landscape. He continues to invest in human capital through “Laboratory Boot Camp” programs, ensuring the next generation of scientists can master the advanced technologies he brings to the region.',
  },
  awards: seed.awards.map((x) => ({ ...x })),
  faqs: defaultFaqs,
  esgPillars: defaultEsgPillars,
  pageHeaders: defaultPageHeaders,
};
