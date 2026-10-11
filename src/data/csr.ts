/**
 * Corporate social responsibility (the CEO's review, point 4). Activities come from the CEO's own profile text and
 * from Flokefama's published news. Activities without a photo yet show an icon panel until photographs arrive.
 */
export type CsrActivity = {
  title: string;
  text: string;
  date?: string;
  image?: string;
  alt?: string;
  icon: string;
  href?: string;
};

export const csrGroups: { title: string; intro: string; items: CsrActivity[] }[] = [
  {
    title: 'Healthcare institutions',
    intro: 'Investing in the hospitals that serve Ghana.',
    items: [
      {
        title: 'Korle-Bu Blood Bank renovation',
        text: 'Renovation of the Blood Bank at Korle-Bu Teaching Hospital.',
        icon: 'fi-rr-hospital',
      },
      {
        title: 'Critical care equipment donations',
        text: 'Ventilators and incubators donated to the University of Ghana Medical Centre (UGMC) and The Trust Hospital.',
        icon: 'fi-rr-heart-rate',
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
        icon: 'fi-rr-flask-gear',
      },
      {
        title: 'University of Ghana partnership',
        text: 'Biomedical Engineering students from the University of Ghana on an industry tour hosted by Flokefama.',
        date: 'March 2026',
        image: '/images/csr/biomedical-students-industry-tour.webp',
        alt: 'University of Ghana Biomedical Engineering students outside Floke Pharmaceuticals',
        icon: 'fi-rr-graduation-cap',
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
        icon: 'fi-rr-hand-holding-heart',
        href: '/news/flokefama-supports-zodf-ramadan-distribution-programme',
      },
    ],
  },
];
