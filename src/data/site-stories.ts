import type { Article } from '@/data/articles';
import { isNewSince } from '@/lib/new-label';

/** A news story that opens another page of the site instead of a news article. */
export type Story = Article & { href?: string };

/** Whether a story still carries its red “New” label: for a month from its date (lib/new-label.ts). */
export const isNew = (a: Story, now = Date.now()) => isNewSince(a.date, now);

/** Where a story opens: its own page, or its news article. */
export const storyHref = (a: Story) => a.href ?? `/news/${a.slug}`;

const CITI = 'https://www.citinewsroom.com/2026/11/flokefama-renovates-hands-over-laboratory-department-at-kpone-hospital/';
/** A photo of the renovated laboratory, without a caption under it. */
const photo = (name: string, width: number, height: number) => ({ type: 'img' as const, src: `/images/csr/${name}.webp`, alt: 'Kpone Hospital Laboratory Department, renovated by Flokefama', width, height, caption: false });

/**
 * The Kpone Hospital laboratory renovation, handed over on 9 November 2026: a news article of its own (/news/…), first
 * in Featured news (home) and in News, Blog & Press (Events & News). Facts as reported by Citi Newsroom.
 */
export const kponeStory: Story = {
  slug: 'kpone-hospital-laboratory-renovation',
  title: 'Flokefama renovates and hands over the Laboratory Department at Kpone Hospital',
  date: '2026-11-09',
  categories: ['News', 'CSR'],
  excerpt:
    'Flokefama has renovated and handed over the Laboratory Department of Kpone Hospital in the Kpone-Katamanso Municipality, to strengthen healthcare delivery and improve diagnostic services for the community.',
  image: { src: '/images/csr/kpone-1.webp', alt: 'The renovated Kpone Hospital Laboratory Department', width: 1080, height: 720 },
  blocks: [
    {
      type: 'p',
      runs: [
        { t: 'Flokefama Company Limited', b: true },
        { t: ' has renovated and handed over the Laboratory Department of ' },
        { t: 'Kpone Hospital', b: true },
        { t: ' in the Kpone-Katamanso Municipality. The handover took place on 9 November 2026.' },
      ],
    },
    {
      type: 'p',
      runs: [{ t: 'The project was carried out to strengthen healthcare delivery and improve diagnostic services at the hospital. A modern laboratory helps doctors make timely clinical decisions and supports quality care for every patient who comes through its doors.' }],
    },
    photo('kpone-handover', 1080, 1052),
    { type: 'h', text: 'Giving back to the community' },
    {
      type: 'p',
      runs: [{ t: 'Speaking at the ceremony, Flokefama’s CEO, ' }, { t: 'Emmanuel Kenney', b: true }, { t: ', said the project reflects the company’s commitment to supporting healthcare and giving back to the communities it serves.' }],
    },
    { type: 'quote', runs: [{ t: 'At Flokefama, giving back is not just a gesture. It is a core responsibility.' }] },
    { type: 'h', text: 'A renovated laboratory' },
    {
      type: 'p',
      runs: [{ t: 'The renovation brought the department’s reception, corridors and laboratory rooms up to date, with new worktops, doors and windows, ready for modern diagnostic equipment.' }],
    },
    photo('kpone-4', 1080, 718),
    photo('kpone-corridor-1', 1080, 720),
    photo('kpone-3', 1080, 720),
    photo('kpone-sign', 1080, 540),
    { type: 'h', text: 'At the handover' },
    {
      type: 'p',
      runs: [
        { t: 'The ceremony was attended by the Acting Greater Accra Regional Director of Health Services, ' },
        { t: 'Dr Robert Amesiya', b: true },
        { t: ', and the Municipal Chief Executive for Kpone-Katamanso, ' },
        { t: 'Samuel Tetteh Kwashie Morton', b: true },
        { t: ', together with hospital management and staff, community leaders and other stakeholders.' },
      ],
    },
    {
      type: 'p',
      runs: [{ t: 'Flokefama thanks the health authorities, the Kpone-Katamanso Municipal Assembly, the management of Kpone Hospital and all its partners for their collaboration on the project.' }],
    },
    photo('kpone-2', 1080, 720),
    {
      type: 'p',
      runs: [
        { t: 'Read the report on ' },
        { t: 'Citi Newsroom', href: CITI },
        { t: ', and see more of Flokefama’s work in hospitals and communities on our ' },
        { t: 'CSR page', href: '/csr#kpone' },
        { t: '.' },
      ],
    },
  ],
  source: CITI,
};

/** A photo from the Ghana Club 100 awards night, without a caption under it. */
const gcPhoto = (name: string, alt: string, width = 853, height = 1280) => ({ type: 'img' as const, src: `/images/news/ghana-club-100-2026-${name}.webp`, alt, width, height, caption: false });

/**
 * The 22nd edition of the Ghana Club 100 Awards, held on 18 November 2026: a news article of its own (/news/…), first
 * in Featured news (home) and in News, Blog & Press (Events & News). The video of the night is still to come.
 */
export const gc100Story: Story = {
  slug: 'flokefama-honoured-at-the-22nd-ghana-club-100-awards',
  title: 'Flokefama honoured at the 22nd Ghana Club 100 Awards',
  date: '2026-11-18',
  categories: ['News'],
  excerpt:
    'Flokefama has been ranked No. 27 among Ghana’s top companies and named sector lead for Healthcare and Pharmaceuticals at the 22nd edition of the Ghana Club 100 Awards.',
  image: { src: '/images/news/ghana-club-100-2026-team.webp', alt: 'The Flokefama team with the Ghana Club 100 2026 trophy', width: 1280, height: 853 },
  blocks: [
    {
      type: 'p',
      runs: [
        { t: 'Flokefama Company Limited', b: true },
        { t: ' has been honoured at the ' },
        { t: '22nd edition of the Ghana Club 100 Awards', b: true },
        { t: ', held on 18 November 2026 and organised by the Ghana Investment Promotion Authority (GIPA).' },
      ],
    },
    {
      type: 'p',
      runs: [
        { t: 'The company was ranked ' },
        { t: 'No. 27', b: true },
        { t: ' in the Ghana Club 100 rankings for 2026 and named ' },
        { t: 'sector lead, No. 1 in Healthcare and Pharmaceuticals', b: true },
        { t: '.' },
      ],
    },
    {
      type: 'p',
      runs: [{ t: 'The Ghana Club 100 recognises the country’s top-performing companies each year. This follows the 21st edition, where Flokefama was also ranked first in the Healthcare sector.' }],
    },
    { type: 'h', text: 'Received by our CEO' },
    {
      type: 'p',
      runs: [{ t: 'The award was received on behalf of the company by Flokefama’s CEO, ' }, { t: 'Emmanuel Kenney', b: true }, { t: '.' }],
    },
    { type: 'video', src: '/videos/ghana-club-100-2026.mp4', poster: '/videos/ghana-club-100-2026-poster.webp', title: 'Flokefama receives its award at the 22nd Ghana Club 100 Awards', width: 688, height: 384 },
    gcPhoto('ceo-portrait', 'Flokefama’s CEO, Emmanuel Kenney, with the Ghana Club 100 2026 trophy', 1280, 1516),
    gcPhoto('ceo-trophy', 'Emmanuel Kenney with the Ghana Club 100 2026 trophy'),
    gcPhoto('ceo-guest', 'Emmanuel Kenney with a guest and the Ghana Club 100 2026 trophy'),
    gcPhoto('ceo-trophy-close', 'The Ghana Club 100 22nd edition trophy awarded to Flokefama Company Limited'),
    { type: 'h', text: 'Thank you' },
    {
      type: 'p',
      runs: [
        { t: 'Flokefama thanks GIPA, its customers, partners and every member of staff for this recognition. See all our awards on the ' },
        { t: 'Awards page', href: '/awards' },
        { t: '.' },
      ],
    },
    gcPhoto('team', 'The Flokefama team at the 22nd Ghana Club 100 Awards', 1280, 853),
  ],
  source: '',
};

/** The site's own stories, newest first: first in Featured news and in News, Blog & Press. */
export const siteStories: Story[] = [gc100Story, kponeStory];

/** The news list with the site's own stories first (each only once, should it also come from the Studio). */
export const withSiteStories = <T extends { slug: string }>(list: T[]): (T | Story)[] => [...siteStories, ...list.filter((a) => !siteStories.some((s) => s.slug === a.slug))];
