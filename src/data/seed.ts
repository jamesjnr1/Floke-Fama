/**
 * Seed content used when Sanity is not configured (local dev, previews) and as the
 * initial import into Sanity. Everything here comes from flokefama.com as of Sep 2026.
 *
 * CLIENT TO CONFIRM before launch (see docs/01-site-audit.md §5):
 *  - Product specs are marked `specsVerified: false` until checked against manufacturer datasheets.
 *  - Metrics: only figures published on the current site are used. "Hospitals served" and
 *    "Systems deployed" are wanted for the hero tracker but have no verified source yet.
 *  - A Ministry of Health partnership was proposed for the trust section; it is NOT shown until confirmed.
 */
import type { Category, Metric, Milestone, Product } from '@/lib/types';

export const categories: Category[] = [
  {
    slug: 'in-vitro-diagnostics',
    title: 'In-Vitro Diagnostics',
    short: 'IVD',
    description: 'Biochemistry and haematology analysers with matched reagents and controls.',
    icon: 'fi-rr-microscope',
  },
  {
    slug: 'critical-care',
    title: 'Patient Monitoring & Critical Care',
    short: 'Critical care',
    description: 'Monitors, defibrillators, CTG and respiratory support for wards and theatres.',
    icon: 'fi-rr-heart-rate',
  },
  {
    slug: 'laboratory',
    title: 'Laboratory Equipment',
    short: 'Laboratory',
    description: 'Microscopy, centrifugation and the everyday instruments of a modern lab.',
    icon: 'fi-rr-flask-gear',
  },
  {
    slug: 'hospital-equipment',
    title: 'Hospital Equipment & Furniture',
    short: 'Hospital',
    description: 'Sterilisation, suction, beds and clinical furniture built for daily use.',
    icon: 'fi-rr-hospital',
  },
  {
    slug: 'consumables',
    title: 'Consumables & Reagents',
    short: 'Consumables',
    description: 'A continuous, reliable supply of reagents, cuvettes and disposables.',
    icon: 'fi-rr-syringe',
  },
];

const datasheet = (name: string) => [{ title: `${name} datasheet`, kind: 'datasheet' as const }];

export const products: Product[] = [
  {
    slug: 'mindray-bs-240',
    name: 'BS-240 Chemistry Analyser',
    brand: 'Mindray',
    category: 'in-vitro-diagnostics',
    summary: 'Compact, fully automated clinical chemistry for hospital and private laboratories.',
    image: '/images/bs-240-stage.webp',
    highlights: ['Fully automated bench-top chemistry', 'Refrigerated reagent compartment', 'Optional ISE module'],
    specs: [
      { label: 'Throughput', value: 'Up to 200 tests/hour (330 with ISE)' },
      { label: 'Sample positions', value: '40' },
      { label: 'Reagent positions', value: '40, refrigerated' },
      { label: 'Format', value: 'Bench-top' },
    ],
    specsVerified: false,
    compatibility: [
      { item: 'Mindray original reagents', status: 'validated' },
      { item: 'Mindray calibrators & controls', status: 'validated' },
      { item: 'Third-party reagents', status: 'consult', note: 'Speak to our applications team' },
    ],
    documents: datasheet('BS-240'),
    tags: ['biochemistry', 'chemistry analyser', 'clinical chemistry', 'automated'],
    featured: true,
  },
  {
    slug: 'mindray-bc-5150',
    name: 'BC-5150 Haematology Analyser',
    brand: 'Mindray',
    category: 'in-vitro-diagnostics',
    summary: '5-part differential haematology analyser for busy hospital laboratories.',
    highlights: ['5-part differential', 'Compact footprint', 'Low reagent consumption'],
    specs: [
      { label: 'Differential', value: '5-part' },
      { label: 'Throughput', value: 'Up to 60 samples/hour' },
      { label: 'Format', value: 'Bench-top' },
    ],
    specsVerified: false,
    compatibility: [
      { item: 'Mindray haematology reagents', status: 'validated' },
      { item: 'Third-party reagents', status: 'consult' },
    ],
    documents: datasheet('BC-5150'),
    tags: ['haematology', 'cbc', 'blood count', '5-part'],
    featured: true,
  },
  {
    slug: 'mindray-bc-3000plus',
    name: 'BC-3000Plus Haematology Analyser',
    brand: 'Mindray',
    category: 'in-vitro-diagnostics',
    summary: 'Dependable 3-part differential haematology for clinics and district hospitals.',
    highlights: ['3-part differential', 'Simple operation', 'Proven reliability'],
    specs: [
      { label: 'Differential', value: '3-part' },
      { label: 'Format', value: 'Bench-top' },
    ],
    specsVerified: false,
    documents: datasheet('BC-3000Plus'),
    tags: ['haematology', 'cbc', '3-part'],
  },
  {
    slug: 'olympus-cx23',
    name: 'CX23 Clinical Microscope',
    brand: 'Olympus',
    category: 'laboratory',
    summary: 'Sharp, bright optics in an ergonomic frame built for long laboratory shifts.',
    image: '/images/products/olympus-cx23.webp',
    highlights: ['LED illumination', 'Ergonomic, low-position controls', 'Durable for daily routine use'],
    specs: [
      { label: 'Illumination', value: 'LED' },
      { label: 'Objectives', value: '4×, 10×, 40×, 100×' },
      { label: 'Head', value: 'Binocular' },
    ],
    specsVerified: false,
    documents: datasheet('CX23'),
    tags: ['microscope', 'microscopy', 'olympus'],
    featured: true,
  },
  {
    slug: 'quantum-analyser',
    name: 'Quantum Health Analyser',
    brand: 'Flokefama Select',
    category: 'in-vitro-diagnostics',
    summary: 'Portable wellness screening analyser for outreach and health checks.',
    image: '/images/products/quantum-analyser.webp',
    highlights: ['Portable carry case', 'Fast screening workflow'],
    specs: [{ label: 'Form factor', value: 'Portable case' }],
    specsVerified: false,
    documents: [],
    tags: ['screening', 'portable', 'wellness'],
  },
  {
    slug: 'cpap-machine',
    name: 'CPAP Machine',
    brand: 'Flokefama Select',
    category: 'critical-care',
    summary: 'Continuous positive airway pressure support for respiratory care.',
    image: '/images/products/cpap.jpg',
    highlights: ['Quiet operation', 'Humidifier compatible'],
    specs: [{ label: 'Therapy', value: 'CPAP' }],
    specsVerified: false,
    documents: [],
    tags: ['respiratory', 'cpap', 'ventilation', 'sleep apnoea'],
    featured: true,
  },
  {
    slug: 'aed-defibrillator',
    name: 'Automated External Defibrillator',
    brand: 'Flokefama Select',
    category: 'critical-care',
    summary: 'Guided, fast-response defibrillation for emergency and ward teams.',
    highlights: ['Voice-guided operation', 'Rapid deployment'],
    specs: [{ label: 'Type', value: 'AED' }],
    specsVerified: false,
    documents: [],
    tags: ['defibrillator', 'aed', 'cardiac', 'emergency'],
  },
  {
    slug: 'ctg-machine',
    name: 'Cardiotocography (CTG) Monitor',
    brand: 'Flokefama Select',
    category: 'critical-care',
    summary: 'Foetal heart rate and uterine activity monitoring for maternity units.',
    highlights: ['Maternal & foetal monitoring', 'Integrated printer'],
    specs: [{ label: 'Application', value: 'Obstetrics' }],
    specsVerified: false,
    documents: [],
    tags: ['ctg', 'maternity', 'foetal monitor', 'obstetrics'],
  },
  {
    slug: 'patient-monitor',
    name: 'Multi-parameter Patient Monitor',
    brand: 'Flokefama Select',
    category: 'critical-care',
    summary: 'Continuous vital-sign monitoring for wards, recovery and ICU.',
    highlights: ['ECG, SpO₂, NIBP, temperature', 'Clear high-contrast display'],
    specs: [{ label: 'Parameters', value: 'ECG, SpO₂, NIBP, Temp' }],
    specsVerified: false,
    documents: [],
    tags: ['patient monitor', 'vital signs', 'icu'],
  },
  {
    slug: 'electronic-scale-height-fat',
    name: 'Smart Body Composition Scale',
    brand: 'Flokefama Select',
    category: 'hospital-equipment',
    summary: 'Electronic scale with height rod and body-fat analysis for clinics.',
    image: '/images/products/scale.jpg',
    highlights: ['Height and weight in one station', 'Body-fat analysis'],
    specs: [{ label: 'Measures', value: 'Weight, height, body fat' }],
    specsVerified: false,
    documents: [],
    tags: ['scale', 'bmi', 'anthropometry'],
  },
  {
    slug: 'autoclave-range',
    name: 'Autoclave Sterilisers',
    brand: 'Flokefama Select',
    category: 'hospital-equipment',
    summary: 'Steam sterilisation in five capacities, from clinic to central sterile department.',
    highlights: ['Five chamber sizes', 'Reliable steam sterilisation'],
    specs: [{ label: 'Capacities', value: '24 L, 35 L, 50 L, 75 L, 100 L' }],
    specsVerified: true,
    documents: [],
    tags: ['autoclave', 'sterilisation', 'cssd'],
  },
  {
    slug: 'suction-machine',
    name: 'Medical Suction Machine',
    brand: 'Flokefama Select',
    category: 'hospital-equipment',
    summary: 'Powerful, portable suction for theatres, wards and emergency care.',
    highlights: ['Portable', 'Adjustable vacuum'],
    specs: [{ label: 'Type', value: 'Electric suction' }],
    specsVerified: false,
    documents: [],
    tags: ['suction', 'aspirator', 'theatre'],
  },
  {
    slug: 'laboratory-centrifuge',
    name: 'Laboratory Centrifuge',
    brand: 'Flokefama Select',
    category: 'laboratory',
    summary: 'Routine sample separation for clinical laboratories.',
    highlights: ['Quiet, balanced operation', 'Safety lid lock'],
    specs: [{ label: 'Application', value: 'Routine clinical separation' }],
    specsVerified: false,
    documents: [],
    tags: ['centrifuge', 'sample prep'],
  },
  {
    slug: 'chemistry-reagents',
    name: 'Chemistry Reagents & Controls',
    brand: 'Mindray',
    category: 'consumables',
    summary: 'Original reagents, calibrators and controls for Mindray chemistry systems.',
    highlights: ['Matched to Mindray analysers', 'Reliable nationwide supply'],
    specs: [{ label: 'System', value: 'Mindray chemistry analysers' }],
    specsVerified: false,
    documents: [],
    tags: ['reagents', 'controls', 'calibrators'],
  },
  {
    slug: 'bs-230-cuvettes',
    name: 'Chemistry Cuvettes (BS-230)',
    brand: 'Mindray',
    category: 'consumables',
    summary: 'Reaction cuvettes for the Mindray BS-230 chemistry analyser.',
    highlights: ['OEM quality', 'Stocked for fast delivery'],
    specs: [{ label: 'Compatible with', value: 'Mindray BS-230' }],
    specsVerified: true,
    documents: [],
    tags: ['cuvettes', 'consumables'],
  },
  {
    slug: 'baby-cot',
    name: 'Hospital Baby Cot',
    brand: 'Flokefama Select',
    category: 'hospital-equipment',
    summary: 'Easy-clean neonatal cot for maternity and paediatric wards.',
    highlights: ['Easy-clean surfaces', 'Stable, mobile base'],
    specs: [{ label: 'Ward', value: 'Maternity / paediatric' }],
    specsVerified: false,
    documents: [],
    tags: ['cot', 'neonatal', 'furniture'],
  },
];

/** "The Results" counters and figures published on flokefama.com (home, about and awards pages). */
export const metrics: Metric[] = [
  { label: 'Hospitals & medical laboratories served', value: 700, suffix: '+', caption: 'And counting' },
  { label: 'Successful system integrations', value: 300, suffix: '+', caption: 'Installed and commissioned' },
  { label: 'Years of experience', value: 18, caption: 'Founded 2008' },
  { label: 'Branches nationwide', value: 6, caption: 'Accra to Aflao' },
];

/** Secondary figures from the current Awards page. */
export const companyFigures: Metric[] = [
  { label: 'Health products', value: 200, suffix: '+' },
  { label: 'Awards & recognition', value: 5, suffix: '+' },
  { label: 'Talented team members', value: 40, suffix: '+' },
];

export const milestones: Milestone[] = [
  {
    id: 'mindray-ivd-2026',
    kicker: 'Award · March 2026',
    title: 'Best in In-Vitro Diagnostics',
    body: 'Breakthrough Award and Best in IVD at the Mindray Central Africa Region awards, Nairobi.',
    date: '2026-03-13',
    image: '/images/mindray-award.webp',
    icon: 'fi-rr-trophy',
  },
  {
    id: 'ghana-club-100',
    kicker: 'Ranking',
    title: 'Ghana Club 100',
    body: 'Recognised among the leading companies in Ghana.',
    icon: 'fi-rr-award',
  },
  {
    id: 'forbes-africa-2026',
    kicker: 'Press · June/July 2026',
    title: 'Featured in Forbes Africa',
    body: '“Ghana: Africa Undiscovered” edition, in collaboration with Penresa.',
    date: '2026-07-31',
    icon: 'fi-rr-star',
  },
  {
    id: 'university-of-ghana',
    kicker: 'Partnership · March 2026',
    title: 'University of Ghana',
    body: 'Shaping the next generation of biomedical engineers with the School of Engineering.',
    date: '2026-03-18',
    icon: 'fi-rr-graduation-cap',
  },
];

export const distributors = ['Mindray', 'Biozek Holland', 'MR Global'];

/** Technology partners (manufacturers Flokefama officially distributes). */
export const technologyPartners = [
  { name: 'Mindray', logo: '/images/partners/mindray.png', role: 'Official distributor' },
  { name: 'Biozek Holland', logo: '/images/partners/biozek.png', role: 'Official distributor' },
  { name: 'MR Global', logo: null, role: 'Official distributor' },
];

/** Clientele shown on the current flokefama.com "Our Partners & Clientele" strip. */
export const clients = [
  { name: 'The Trust Hospital', logo: '/images/partners/trust-hospital.jpg' },
  { name: 'Korle Bu Teaching Hospital', logo: '/images/partners/korle-bu.png' },
  { name: 'Komfo Anokye Teaching Hospital', logo: '/images/partners/kath.webp' },
  { name: 'University of Ghana Medical Centre', logo: '/images/partners/ugmc.png' },
  { name: 'Euracare', logo: '/images/partners/euracare.png' },
  { name: 'LEKMA Hospital', logo: '/images/partners/lekma.png' },
];

export const branches = [
  { name: 'Santa Maria', detail: 'Head office, Accra' },
  { name: 'Korle-Bu', detail: 'Opposite Korle Bu Teaching Hospital' },
  { name: 'Okaishie', detail: 'Adepa Building, Ground Floor' },
  { name: 'Kumasi', detail: 'Kwadaso Estate' },
  { name: 'Aflao', detail: '200 m from Makavo Junction' },
  { name: 'Techiman', detail: 'Near Melcom Techiman' },
];

export const contact = {
  address: 'Flokefama Company Limited, Santa Maria, Accra, Ghana',
  /** Head office coordinates, from the map on the current Contact page. */
  lat: 5.5966475,
  lng: -0.2732217,
  phone: '+233 53 339 2863',
  phoneHref: 'tel:+233533392863',
  whatsapp: 'https://wa.me/233533392863',
  info: 'info@flokefama.com',
  sales: 'sales@flokefama.com',
  support: 'support@flokefama.com',
};

export const maps = {
  embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.621062634358!2d-0.27322170000000003!3d5.5966475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf996210a66e9f%3A0xcc9653b8022f3b8d!2sFlokefama%20Company%20Limited!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh',
  directions: `https://www.google.com/maps/dir/?api=1&destination=${contact.lat},${contact.lng}&travelmode=driving`,
  open: `https://www.google.com/maps/search/?api=1&query=${contact.lat},${contact.lng}`,
};

/** Testimonials, verbatim from the current home and About pages. */
export const testimonials = [
  {
    quote: 'Flokefama has been our go-to supplier for medical equipment, and they never disappoint. Their products are top-notch, and their customer service is exceptional. Highly recommended!',
    name: 'Dr. Kwame Asante',
    role: 'Medical Director, Lifecare Hospital',
  },
  {
    quote: 'We urgently needed diagnostic tools for our clinic, and Flokefama delivered right on time. Their team provided excellent after-sales support, ensuring everything was set up correctly.',
    name: 'Patricia Osei',
    role: 'Clinic Administrator',
  },
  {
    quote: 'Flokefama has been instrumental in equipping our laboratory with state-of-the-art devices. Their expertise and product recommendations have improved our efficiency significantly.',
    name: 'Dr. Nana Kusi',
    role: 'Lab Scientist',
  },
];

/** Core values, from the current About page. */
export const coreValues = [
  { title: 'Honesty', icon: 'fi-rr-shield-check', text: 'Transparent and truthful in all business dealings, with clear communication and realistic expectations. We build trust by consistently delivering what we promise.' },
  { title: 'Integrity', icon: 'fi-rr-badge-check', text: 'Strong ethical standards and consistent quality and service: prompt delivery, met deadlines and a swift response to customer needs.' },
  { title: 'Innovation', icon: 'fi-rr-bulb', text: 'Continuously embracing new ideas, technologies and solutions to enhance efficiency and meet evolving needs, with cutting-edge solutions and exceptional support.' },
  { title: 'Respect', icon: 'fi-rr-users', text: 'Valuing people through professionalism, inclusivity and strong relationships, treating every client, partner and team member with care and attentiveness.' },
] as const;

/** Services, as listed on the current Services and About pages. */
export const serviceList = [
  { icon: 'fi-rr-box-open', title: 'Medical equipment sales', body: 'A wide range of high-quality medical equipment for the diverse needs of hospitals, clinics and laboratories.' },
  { icon: 'fi-rr-settings', title: 'Installation & commissioning', body: 'Proper installation and setup for the efficiency and longevity of every system.' },
  { icon: 'fi-rr-shield-check', title: 'Technical support & maintenance', body: 'Regular maintenance for continuous, uninterrupted operation and minimal downtime.' },
  { icon: 'fi-rr-chart-line-up', title: 'Calibration services', body: 'Precise calibration for accuracy and reliability, because accuracy is critical in diagnostics and treatment.' },
  { icon: 'fi-rr-tool-box', title: 'Repairs & spare parts supply', body: 'Efficient repairs and genuine parts that minimise disruption to healthcare delivery.' },
  { icon: 'fi-rr-graduation-cap', title: 'Training & capacity building', body: 'Programmes and ongoing support that empower professionals to operate equipment effectively.' },
] as const;

/** "Why choose Flokefama?", from the current Services page. */
export const whyChoose = [
  { icon: 'fi-rr-link-alt', title: 'End-to-end solutions', body: 'From procurement and installation to training and maintenance.' },
  { icon: 'fi-rr-globe', title: 'Globally recognised brands', body: 'Official distributor of Mindray, Biozek Holland and MR Global.' },
  { icon: 'fi-rr-headset', title: 'Reliable after-sales support', body: 'Rapid response service when it matters most.' },
  { icon: 'fi-rr-marker', title: 'Nationwide reach', body: 'Six branches, from Accra and Kumasi to Aflao and Techiman.' },
] as const;

/** Awards shown on the current Awards page (photos of the actual awards) and in the Media Centre. */
export const awards = [
  {
    id: 'gc100-healthcare',
    title: 'No.1 company in the Healthcare sector',
    body: 'Ranked 1st in the Healthcare sector at the 21st edition of the Ghana Club 100 Awards, Ghana Investment Promotion Centre.',
    year: '2024',
    image: '/images/awards/ghana-club-100-healthcare.webp',
    alt: 'Ghana Investment Promotion Centre certificate ranking Flokefama 1st in the Healthcare sector, Ghana Club 100',
  },
  {
    id: 'gc100',
    title: 'Ghana Club 100',
    body: 'Ranked No. 49 among Ghana’s top companies, 21st edition of the Ghana Club 100.',
    year: '2024',
    image: '/images/awards/ghana-club-100-trophy.webp',
    alt: 'Ghana Club 100 21st edition trophy awarded to Flokefama Company Limited',
  },
  {
    id: 'mindray-2024',
    title: 'Mindray Market Breakthrough Award',
    body: 'Presented by Shenzhen Mindray Bio-Medical Electronics to Flokefama Company Limited.',
    year: '2024',
    image: '/images/awards/mindray-breakthrough-2024.webp',
    alt: 'Mindray 2024 Market Breakthrough Award trophy',
  },
  {
    id: 'emy-2024',
    title: 'Man of the Year, Health',
    body: 'Conferred on Emmanuel Teye Kwabena Kenney at the 9th annual EMY Africa Awards, Accra, 24 November 2024.',
    year: '2024',
    image: '/images/awards/emy-africa-2024.webp',
    alt: 'EMY Africa Awards certificate: Man of the Year, Health',
  },
  {
    id: 'mindray-ivd-2026',
    title: 'Breakthrough Award & Best in IVD',
    body: 'Mindray Central Africa Region awards, JW Marriott, Nairobi.',
    year: '2026',
    image: '/images/mindray-award.webp',
    alt: 'The Flokefama team receiving the Mindray IVD awards on stage in Nairobi',
  },
];

/** Events & Activities (the current site lists past events only). */
export const events = [
  {
    id: 'floke-praise-2025',
    title: 'Floke Praise 2025: Celebrating 17 Years of Saving Lives!',
    date: '2025-10-18',
    day: '18',
    month: 'Oct',
    year: '2025',
    time: '3:00 pm – 7:00 pm',
    venue: 'Flokefama Company Limited, 2 Regy St., Accra',
    body: 'An evening of gratitude, worship and celebration as Flokefama Company Ltd marked 17 years of saving lives and serving.',
    price: 'Free',
  },
];

/** Company statements, verbatim in substance from the current "About us" page. */
export const purpose = [
  { label: 'Mission', icon: 'fi-rr-bullseye', text: 'To provide world-class medical solutions to all medical facilities and laboratories in the West African sub-region.' },
  { label: 'Vision', icon: 'fi-rr-eye', text: 'To build a localised industrial complex that produces medical equipment and reagents locally, and to be listed on the Ghana Stock Exchange by 2030.' },
  { label: 'Aim', icon: 'fi-rr-flask-gear', text: 'To establish a production plant in Ghana for reagents and hospital disposables, boosting the economy and creating meaningful, well-paying jobs.' },
] as const;

/** Media Centre posts published on flokefama.com (titles, dates and summaries as published). */
export const news = [
  {
    id: 'quality-verification',
    date: '3 August 2026',
    kind: 'Insight',
    title: 'Quality verification: the cornerstone of healthcare excellence in Ghana',
    summary: 'Analysers, reagents and IVD kits directly inform clinical decisions. Why verifying quality before delivery protects patients.',
  },
  {
    id: 'forbes-africa',
    date: '31 July 2026',
    kind: 'Press',
    title: 'Flokefama featured in Forbes Africa: driving healthcare excellence across Ghana',
    summary: 'Featured in the June/July 2026 “Ghana: Africa Undiscovered” edition of Forbes Africa, in collaboration with Penresa.',
    image: '/images/forbes-africa-2026.webp',
  },
  {
    id: 'mindray-ivd-awards',
    date: '1 April 2026',
    kind: 'Award',
    title: 'A milestone for Ghana: Flokefama sweeps prestigious Mindray IVD awards',
    summary: 'The Breakthrough Award and Best in In-Vitro Diagnostics at the Mindray Central Africa Region ceremony, JW Marriott, Nairobi.',
    image: '/images/mindray-award.webp',
  },
  {
    id: 'university-of-ghana',
    date: '18 March 2026',
    kind: 'Partnership',
    title: 'Partnering with the University of Ghana to shape the next generation of biomedical engineers',
    summary: 'Featured in the University of Ghana School of Engineering newsletter.',
  },
  {
    id: 'zodf-ramadan',
    date: '18 March 2026',
    kind: 'Community',
    title: 'Flokefama supports the ZODF Ramadan distribution programme',
    summary: 'Supporting the ZODF Ramadan distribution programme in the community.',
  },
  {
    id: 'quality-is-tested',
    date: '17 February 2026',
    kind: 'Insight',
    title: 'Quality is tested',
    summary: 'From the Flokefama Media Centre.',
  },
];

