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
export interface Logo { name: string; logo: string | null; w: number; h: number; role?: string; /** Clients: shown instead of the name and logo (the CEO: hospitals are represented by codes) */ code?: string; /** Clients: kind of facility shown with the code, e.g. Teaching hospital */ kind?: string }
/** A photo for a gallery (engineering department, event albums). */
export interface Photo { src: string; alt: string; caption?: string }
/** One of the home page's “Our solutions” pillars. No `image`: a placeholder shows until a photo is set in the Studio. */
export interface Solution { title: string; body: string; points: string[]; href: string; image?: string; alt?: string; /** 'contain': a product photo on white; 'cover': a photo filling the frame */ fit: 'contain' | 'cover' }
/** A photo or video for the home hero (installations by the engineering department). */
export interface HeroMedia { kind: 'image' | 'video'; src: string; poster?: string; caption: string; label?: string }
/** An album of event photos on the Events page. */
export interface EventAlbum { title: string; date?: string; photos: Photo[] }
/** A branch; `phone` as written locally, e.g. 020 025 0127. */
export interface Branch { name: string; detail: string; phone?: string }
export interface Award { id: string; title: string; body: string; year: string; image: string; alt: string }
export interface Faq { q: string; a: string; link?: { href: string; label: string } }
export interface EsgPillar { label: string; icon: string; title: string; body: string; image: string; alt: string }
export interface PageHeader { title: string; highlight: string; lead: string; image?: string; position?: string; /** 'strong': a darker veil, for bright photos */ veil?: 'strong'; /** Keep this built-in photo even when a photo is set in the Studio */ lockImage?: boolean; /** Show the italic words first, e.g. “*Saving Lives* since 2008” */ emphasisFirst?: boolean }
export type PageKey = 'about' | 'services' | 'shop' | 'events' | 'awards' | 'esg' | 'contact';

export interface SiteContent {
  contact: Contact;
  maps: { embed: string; directions: string; open: string };
  branches: Branch[];
  technologyPartners: Logo[];
  clients: Logo[];
  hero: { title: string; highlight: string; lead: string };
  /** Installation photos and videos shown after the first hero slide; `heroMediaOnly` hides the stock equipment photos. */
  heroMedia: HeroMedia[];
  heroMediaOnly: boolean;
  solutions: { kicker: string; title: string; highlight: string; lead: string; items: Solution[] };
  engineering: { title: string; lead: string; photos: Photo[] };
  eventAlbums: EventAlbum[];
  /** Extra numbers hospitals can call, shown on the hospital sign-in page (added by the team in the Studio). */
  signInPhones: { label: string; phone: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  purpose: { label: string; icon: string; text: string }[];
  coreValues: { title: string; icon: string; text: string }[];
  servicesInBrief: { icon: string; title: string; text: string }[];
  whyChoose: { icon: string; title: string; body: string }[];
  /** Photos used around the site (Studio: Site content → Photos). */
  photos: { whatWeDo: string; office: string };
  ceo: {
    photo: string;
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
    a: 'Prices depend on the model, configuration, quantity and the service package you choose, so sales confirms the price of every order. Add products to your cart, or press “Order now” on any product, and send the order. A specialist replies within one business day.',
    link: { href: '/products', label: 'Browse the shop' },
  },
  {
    q: 'Can I see the equipment working before I buy?',
    a: 'Yes. Press “Schedule a demonstration” on any product page and our applications team will arrange it at your facility.',
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

/** The six pillars (the CEO's list), as built in; the Studio's “Our solutions” replaces them once filled in. */
export const defaultSolutions: SiteContent['solutions'] = {
  kicker: 'Our solutions',
  title: 'Six pillars of',
  highlight: 'medical infrastructure.',
  lead: 'From diagnostics to delivery: one partner for the equipment, the engineers and the supplies that keep it running.',
  items: [
    { title: 'In-Vitro Diagnostics', body: 'Analysers with matched reagents and controls, from the official distributor of Mindray.', points: ['Biochemistry & haematology analysers', 'Point-of-care testing', 'Microbiology equipment'], href: '/products?category=in-vitro-diagnostics', image: '/images/products/auto-heamatology-analyzer-bc5150.webp', alt: 'Mindray BC-5150 haematology analyser', fit: 'contain' },
    { title: 'Patient Monitoring & Lifecare Systems', body: 'Monitors, defibrillators, CTG and life support for wards, theatres and intensive care.', points: ['Patient monitors', 'Defibrillators & ECG', 'Ventilators, CPAP & oxygen therapy'], href: '/products?category=medical-equipment', image: '/images/products/patient-monitor-comen.webp', alt: 'Comen patient monitor', fit: 'contain' },
    { title: 'Imaging', body: 'Diagnostic imaging from portable ultrasound to CT, MRI and digital X-ray.', points: ['Ultrasound', 'CT, MRI & digital X-ray', 'Mammography'], href: '/services#departments', image: '/images/equipment/ct.webp', alt: 'A CT scanner in a hospital imaging room', fit: 'cover' },
    { title: 'Orthopaedics', body: 'Implants and instruments for joint replacement, fracture fixation and spinal surgery.', points: ['Arthroplasty (hip & knee)', 'Trauma plates & nails', 'Spine systems'], href: '/services#departments', image: '/images/solutions/arthroplasty.webp', alt: 'Orthopaedic joint replacement implants', fit: 'cover' },
    { title: 'Biomedical Engineering & Spare Parts', body: 'Our engineers install, calibrate and maintain every system we supply, with genuine spare parts.', points: ['Installation & commissioning', 'Calibration & repairs', 'Genuine spare parts'], href: '/services', image: '/images/pillars/biomedical-lab.webp', alt: 'A laboratory scientist in gloves working with laboratory equipment', fit: 'cover' },
    // The CEO (Oct 2026): the earlier photo (an analyser lamp) is not a reagent; a placeholder shows until a real photo is set in the Studio
    { title: 'Reagents & Consumables', body: 'A continuous, reliable supply of reagents, cuvettes, lamps and disposables.', points: ['Chemistry reagents', 'Spare lamps & cuvettes', 'Six branches nationwide'], href: '/products?category=medical-consumables', fit: 'cover' },
  ],
};

export const defaultEngineering: SiteContent['engineering'] = {
  title: 'Our engineering department',
  lead: 'Flokefama’s own biomedical engineers install, commission, calibrate and maintain the equipment we supply, across all six branches.',
  photos: [],
};

export const defaultPageHeaders: Record<PageKey, PageHeader> = {
  // The CEO (Oct 2026): “Saving Lives since 2008”, with Saving Lives emphasised
  about: { title: 'since 2008', highlight: 'Saving Lives', emphasisFirst: true, lead: 'FLOKEFAMA is a multiple award-winning company and one of the most trusted medical equipment suppliers in Ghana.', image: '/images/headers/about-microscopes.webp', position: '40% 50%', veil: 'strong', lockImage: true },
  services: { title: 'We go beyond just supplying', highlight: 'medical equipment', lead: 'End-to-end solutions, from procurement and installation to training and maintenance.', image: '/images/headers/services-technician.webp', position: '50% 40%', veil: 'strong', lockImage: true },
  shop: { title: 'Clinical-grade equipment.', highlight: 'Instantly searchable.', lead: '{count} products for hospitals and laboratories, with installation, training and after-sales support on everything we supply.', image: '/images/headers/shop.webp', position: '50% 35%' },
  events: { title: 'Moments that', highlight: 'bring us together', lead: 'Celebrations, community programmes and industry events from across the Flokefama family.', image: '/images/headers/team-lab.webp', position: '40% 30%', veil: 'strong', lockImage: true },
  awards: { title: 'Recognitions that', highlight: 'reflect our impact', lead: 'Our commitment to excellence, innovation and service, recognized through prestigious awards and honors.', image: '/images/headers/awards-cup.webp', position: '50% 50%', veil: 'strong', lockImage: true },
  esg: { title: 'Healthcare that', highlight: 'gives back', lead: 'Our corporate social responsibility: supporting healthcare institutions, developing professionals and serving communities across Ghana.', image: '/images/headers/esg-care.webp', position: '30% 60%', veil: 'strong', lockImage: true },
  contact: { title: 'Get in touch', highlight: 'with us', lead: 'We’re here to provide total healthcare solutions. Reach out to us anytime.', image: '/images/headers/contact-support.webp', position: '50% 30%' },
};

export const defaultSite: SiteContent = {
  ...withDerived(seed.contact, seed.maps.embed),
  branches: [...seed.branches],
  technologyPartners: seed.technologyPartners.map((x) => ({ ...x })),
  clients: seed.clients.map((x) => ({ ...x })),
  hero: { title: 'Ghana’s No.1', highlight: 'Healthcare Company', lead: 'Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.' },
  heroMedia: [],
  heroMediaOnly: false,
  solutions: defaultSolutions,
  engineering: defaultEngineering,
  eventAlbums: [],
  signInPhones: [],
  testimonials: [...seed.testimonials],
  purpose: seed.purpose.map((x) => ({ ...x })),
  coreValues: seed.coreValues.map((x) => ({ ...x })),
  servicesInBrief: seed.servicesInBrief.map((x) => ({ ...x })),
  // The original list repeated "High-quality, globally recognized medical brands"; keep each point once.
  whyChoose: seed.whyChoose.filter((x, i, all) => all.findIndex((y) => y.title === x.title) === i).map((x) => ({ ...x })),
  // The CEO profile as written by the CEO (Website Redesign Review, Oct 2026)
  photos: { whatWeDo: '/images/home-equipment.webp', office: '/images/office-team.webp' },
  ceo: {
    photo: '/images/ceo-emmanuel-kenney.jpg',
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
