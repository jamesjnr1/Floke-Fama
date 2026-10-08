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
export interface PageHeader { title: string; highlight: string; lead: string; image?: string; position?: string }
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
  ceo: { name: string; role: string; bio: string[] };
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
    a: 'Flokefama is the official distributor of Mindray, Biozek Holland and MR Global, alongside other trusted manufacturers in the catalogue.',
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
    link: { href: '/contact', label: 'Contact and directions' },
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
  about: { title: 'Purveyor of excellence', highlight: 'in healthcare', lead: 'FLOKEFAMA is a multiple award-winning company and one of the most trusted medical equipment suppliers in Ghana.', image: '/images/news/the-forgotten-stage-of-quality-cover.webp' },
  services: { title: 'We go beyond just supplying', highlight: 'medical equipment', lead: 'End-to-end solutions, from procurement and installation to training and maintenance.', image: '/images/headers/services.webp', position: '50% 40%' },
  shop: { title: 'Clinical-grade equipment.', highlight: 'Instantly searchable.', lead: '{count} products for hospitals and laboratories, with installation, training and after-sales support on everything we supply.', image: '/images/headers/shop.webp', position: '50% 35%' },
  events: { title: 'Moments that', highlight: 'bring us together', lead: 'Celebrations, community programmes and industry events from across the Flokefama family.', image: '/images/headers/events-ghana.webp', position: '50% 40%' },
  awards: { title: 'Recognitions that', highlight: 'reflect our impact', lead: 'Our commitment to excellence, innovation and service, recognized through prestigious awards and honors.', image: '/images/news/a-milestone-for-ghana-flokefama-sweeps-prestigious-mindray-ivd-awards-cover.webp', position: '50% 45%' },
  esg: { title: 'Healthcare that', highlight: 'gives back', lead: 'How Flokefama creates value beyond supply: for patients, for communities and for Ghana’s economy.', image: '/images/headers/esg-ghana.webp', position: '50% 30%' },
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
  ceo: {
    name: 'Mr. Emmanuel Kenney',
    role: 'Founder & Chief Executive Officer, Flokefama Company Limited',
    bio: [
      "Behind Flokefama’s vision is Mr. Emmanuel Kenney, a Ghanaian entrepreneur and business leader whose journey into the healthcare industry is deeply personal.",
      "Mr. Kenney brings a strong combination of academic preparation, leadership experience and entrepreneurial vision to his role as Chief Executive Officer. He is a graduate of Sanford Business School in the United States of America, where he developed a strong foundation in business management and leadership. He is also an alumnus of the prestigious St. Augustine’s College, Cape Coast, an institution renowned for academic excellence, discipline and leadership development.",
      "As the Founder and Chief Executive Officer of Flokefama Company Limited, Mr. Kenney has built the company around a simple but powerful conviction: better healthcare should not be a privilege, it should be accessible, efficient and delivered with dignity and excellence.",
      "His passion for healthcare was shaped in part by his own experience with surgery. Having personally experienced the challenges and difficulties associated with surgical care, he came away with a determination that others should not have to go through the same experience where better systems, technology and equipment could make a difference. That experience became one of the driving forces behind his commitment to improving healthcare delivery through access to modern medical equipment, technology and innovative solutions. Today, he leads Flokefama in providing world-class healthcare equipment and solutions across Ghana and West Africa.",
      "Since its establishment in 2008, Flokefama has grown into a multiple award-winning company, including Ghana Club 100 company, and has a reputation for quality, reliability and innovation in the healthcare sector. Under Mr. Kenney’s leadership, the company has also championed partnerships with academic and professional institutions to help develop industry-ready engineers and technical professionals capable of supporting and transforming Ghana’s healthcare infrastructure.",
    ],
  },
  awards: seed.awards.map((x) => ({ ...x })),
  faqs: defaultFaqs,
  esgPillars: defaultEsgPillars,
  pageHeaders: defaultPageHeaders,
};
