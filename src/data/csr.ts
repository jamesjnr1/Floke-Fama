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
    title: 'Professional development',
    intro: 'Building the skills behind modern healthcare.',
    items: [
      {
        title: 'Laboratory Boot Camp',
        text: 'Hands-on programmes that help the next generation of laboratory scientists master advanced diagnostic technology.',
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

/** A part of a project: a label, its photos and what they show. */
export type CsrGroup = { caption: string; title?: string; text?: string; points?: string[]; photos: CsrPhoto[] };

/** Projects from Flokefama's CSR presentation, each in a few parts. */
export const csrProjects: { label: string; title: string; text?: string; stat?: { value: string; label: string }; href?: string; groups: CsrGroup[] }[] = [
  {
    label: 'Pentecost Hospital, Accra Madina',
    title: 'A new Central Sterile Services Department',
    text: 'Flokefama supported Pentecost Hospital, a CHAG facility in Accra Madina, to build a brand-new Central Sterile Services Department (CSSD).',
    groups: [
      {
        caption: 'Construction phase',
        title: 'Infrastructure support & structural development',
        points: ['Civil works and a facility layout designed for sterile processing standards.', 'Robust masonry, utility conduits and security doors tailored for medical compliance.'],
        photos: [1, 2].map((n) => ({ src: `/images/csr/pentecost-construction-${n}.webp`, alt: `The Pentecost Hospital CSSD under construction (${n} of 2)` })),
      },
      {
        caption: 'Completed CSSD facility',
        title: 'Modern sterilisation & clinical quality standards',
        points: ['Fully tiled walls and floors for seamless decontamination and maintenance.', 'Enhanced healthcare services for Pentecost Hospital and the surrounding Madina community.'],
        photos: [1, 2, 3].map((n) => ({ src: `/images/csr/pentecost-cssd-${n}.webp`, alt: `The completed CSSD at Pentecost Hospital (${n} of 3)` })),
      },
    ],
  },
  {
    label: 'Korle Bu Teaching Hospital',
    title: 'Korle Bu Blood Bank renovation',
    groups: [
      { caption: 'Facility dedication', text: 'Official handover and dedication of the renovated blood bank at Korle Bu Teaching Hospital, modernising infrastructure for critical healthcare support and community access.', photos: [{ src: '/images/csr/korle-bu-blood-bank-dedication.webp', alt: 'Staff and Flokefama team at the dedication of the refurbished Korle Bu blood bank' }] },
      { caption: 'Inspection & handover', text: 'Hospital leadership and officials reviewing the upgraded diagnostic equipment and refurbished facilities.', photos: [{ src: '/images/csr/korle-bu-blood-bank-inspection.webp', alt: 'Hospital leadership and the Flokefama team inspecting the renovated blood bank' }] },
    ],
  },
  {
    label: 'University of Ghana Medical Centre',
    title: 'Neonatal incubators for UGMC',
    groups: [
      { caption: 'Equipment donation', text: 'Advanced infant incubators and medical equipment presented to the University of Ghana Medical Centre (UGMC).', photos: [{ src: '/images/csr/ugmc-incubator-donation.webp', alt: 'Neonatal incubators presented to the University of Ghana Medical Centre' }] },
      { caption: 'Official handover', text: 'The donation ceremony with UGMC management and hospital officials, reinforcing our commitment to critical care across Ghana.', photos: [{ src: '/images/csr/ugmc-handover.webp', alt: 'Handover ceremony with UGMC management and the Flokefama team' }] },
    ],
  },
  {
    label: 'The Trust Hospital',
    title: 'Equipment for The Trust Hospital',
    groups: [
      { caption: 'Donation ceremony', text: 'Presentation and set-up of specialised medical equipment at The Trust Hospital.', photos: [{ src: '/images/csr/trust-hospital-donation.webp', alt: 'Medical equipment being presented and set up at The Trust Hospital' }] },
      { caption: 'Official handover', text: 'Our leadership with hospital officials and staff, supporting quality healthcare delivery and community wellness.', photos: [{ src: '/images/csr/trust-hospital-handover.webp', alt: 'Flokefama leadership with officials of The Trust Hospital' }] },
    ],
  },
  {
    label: 'Zongo Development Fund',
    title: 'Supporting the Zongo Development Fund',
    text: 'Targeted assistance for infrastructure, education and community welfare, strengthening our ties with national development funds and community leaders.',
    stat: { value: 'GH₵ 200,000', label: 'Financial support to the Zongo Development Fund' },
    href: '/news/flokefama-supports-zodf-ramadan-distribution-programme',
    groups: [
      { caption: 'Donation ceremony', text: 'Official presentation of our financial contribution to the Zongo Development Fund.', photos: [{ src: '/images/csr/zodf-cheque-presentation.webp', alt: 'Flokefama presenting a GH₵200,000 cheque to the Zongo Development Fund' }] },
    ],
  },
  {
    label: 'Promoting females in engineering',
    title: 'Women in engineering and the next generation',
    href: '/news/flokefama-partners-with-university-of-ghana-to-shape-the-next-generation-of-biomedical-engineers',
    groups: [
      { caption: 'Educational outreach', text: 'Our ongoing sponsorship, industrial tours and academic awards for biomedical and engineering students, featured in the University of Ghana engineering newsletter.', photos: [{ src: '/images/csr/engineering-newsletter.webp', alt: 'University of Ghana engineering newsletter featuring the Flokefama industry tour' }] },
      { caption: 'Female in Engineering initiative', text: 'Partnering with academic institutions to empower women and promote excellence in engineering.', photos: [{ src: '/images/csr/female-engineering-partnership.webp', alt: 'Flokefama and academic partners outside the Flokefama office' }] },
      { caption: 'Industry collaboration', text: 'Our leadership and engineering teams working with partners and healthcare facilities across the country.', photos: [{ src: '/images/csr/engineering-team.webp', alt: 'Flokefama team members at the Flokefama sign' }, { src: '/images/csr/engineering-industry-tour.webp', alt: 'Biomedical engineering students on an industry tour at Floke Pharmaceuticals' }] },
    ],
  },
];
