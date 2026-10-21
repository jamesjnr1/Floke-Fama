/**
 * Corporate social responsibility (the CEO's review, point 4). Activities come from the CEO's own profile text and
 * from Flokefama's published news, and the featured projects from Flokefama's CSR presentation (Support centre, Oct 2026).
 */
export type CsrActivity = {
  title: string;
  text: string;
  date?: string;
  image?: string;
  alt?: string;
  href?: string;
};

export const csrGroups: { title: string; intro: string; items: CsrActivity[] }[] = [
  {
    title: 'Healthcare institutions',
    intro: 'Investing in the hospitals that serve Ghana.',
    items: [
      {
        title: 'Critical care equipment donations',
        text: 'Ventilators and incubators donated to hospitals, including The Trust Hospital.',
      },
    ],
  },
  {
    title: 'Professional development',
    intro: 'Building the skills behind modern healthcare.',
    items: [
      {
        title: 'Laboratory Boot Camp',
        text: 'Hands-on programmes that help the next generation of laboratory scientists master advanced diagnostic technology.',
      },
      {
        title: 'University of Ghana partnership',
        text: 'Biomedical Engineering students from the University of Ghana on an industry tour hosted by Flokefama.',
        date: 'March 2026',
        image: '/images/csr/biomedical-students-industry-tour.webp',
        alt: 'University of Ghana Biomedical Engineering students outside Floke Pharmaceuticals',
        href: '/news/flokefama-partners-with-university-of-ghana-to-shape-the-next-generation-of-biomedical-engineers',
      },
    ],
  },
  {
    title: 'Communities',
    intro: 'Serving people beyond the hospital walls.',
    items: [
      {
        title: 'ZoDF Ramadan programme',
        text: 'Financial support for the Zongo Development Fund’s 2026 Ramadan distribution to communities and the vulnerable.',
        date: 'March 2026',
        image: '/images/news/flokefama-supports-zodf-ramadan-distribution-programme-cover.webp',
        alt: 'Flokefama presenting its support to the Zongo Development Fund',
        href: '/news/flokefama-supports-zodf-ramadan-distribution-programme',
      },
    ],
  },
];

/** Our CSR commitment, in three parts (from Flokefama's CSR presentation). */
export const csrCommitments = [
  { label: 'Partnering facilities', icon: 'fi-rr-hospital', title: 'Giving back value', text: 'As part of our corporate social responsibility, Flokefama gives back its value share to partnering facilities, supporting operational excellence and healthcare infrastructure.' },
  { label: 'Professional development', icon: 'fi-rr-graduation-cap', title: 'Empowering individuals', text: 'We actively support individuals who excel in their line of duty and wish to further their studies, fostering continuous education and career advancement.' },
  { label: 'Saving lives agenda', icon: 'fi-rr-hand-holding-heart', title: 'Bringing hope & care', text: 'We are deeply committed to the saving lives agenda: bringing hope, resources and healthcare assistance to all those in need.' },
];

export type CsrPhoto = { src: string; alt: string; caption?: string; text?: string };

/** Kpone Hospital: facility renovation and diagnostic centre refurbishment, before and after. */
export const kpone = {
  title: 'Kpone Hospital refurbishment',
  text: 'Comprehensive infrastructure modernisation and diagnostic centre enhancement, carried out to expand access to healthcare and improve the facility for the surrounding community.',
  before: [1, 2, 3, 4].map((n): CsrPhoto => ({ src: `/images/csr/kpone-before-${n}.webp`, alt: `Kpone Hospital building before the renovation (${n} of 4)` })),
  after: [1, 2, 3, 4, 5, 6].map((n): CsrPhoto => ({ src: `/images/csr/kpone-after-${n}.webp`, alt: `Kpone Hospital after the renovation (${n} of 6)` })),
};

/** Projects with two photos each. */
export const csrProjects: { label: string; title: string; photos: CsrPhoto[] }[] = [
  {
    label: 'Korle Bu Teaching Hospital',
    title: 'Korle Bu Blood Bank renovation',
    photos: [
      { src: '/images/csr/korle-bu-blood-bank-dedication.webp', alt: 'Staff and Flokefama team at the dedication of the refurbished Korle Bu blood bank', caption: 'Facility dedication', text: 'Official handover and dedication of the renovated blood bank at Korle Bu Teaching Hospital, modernising infrastructure for critical healthcare support and community access.' },
      { src: '/images/csr/korle-bu-blood-bank-inspection.webp', alt: 'Hospital leadership and the Flokefama team inspecting the renovated blood bank', caption: 'Inspection & handover', text: 'Hospital leadership and officials reviewing the upgraded diagnostic equipment and refurbished facilities.' },
    ],
  },
  {
    label: 'University of Ghana Medical Centre',
    title: 'Neonatal incubators for UGMC',
    photos: [
      { src: '/images/csr/ugmc-incubator-donation.webp', alt: 'Neonatal incubators presented to the University of Ghana Medical Centre', caption: 'Equipment donation', text: 'Advanced infant incubators and medical equipment presented to the University of Ghana Medical Centre (UGMC).' },
      { src: '/images/csr/ugmc-handover.webp', alt: 'Handover ceremony with UGMC management and the Flokefama team', caption: 'Official handover', text: 'The donation ceremony with UGMC management and hospital officials, reinforcing our commitment to critical care across Ghana.' },
    ],
  },
];
