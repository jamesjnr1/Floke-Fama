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
    image: '/images/solution-ivd.webp',
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

export const metrics: Metric[] = [
  { label: 'Years in service', value: 18, caption: 'Founded 2008' },
  { label: 'Branches nationwide', value: 6, caption: 'Accra to Aflao' },
  { label: 'Products in catalogue', value: 92, suffix: '+', caption: 'Listed in the online catalogue' },
  { label: 'Industry awards', value: 5, caption: 'Incl. Mindray Best in IVD' },
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
  phone: '+233 53 339 2863',
  phoneHref: 'tel:+233533392863',
  whatsapp: 'https://wa.me/233533392863',
  info: 'info@flokefama.com',
  sales: 'sales@flokefama.com',
  support: 'support@flokefama.com',
};
