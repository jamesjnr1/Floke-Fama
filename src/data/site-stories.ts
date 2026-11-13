import type { Article } from '@/data/articles';

/** A news story that opens another page of the site instead of a news article. */
export type Story = Article & { href?: string; /** Shows a red “New” label on its photo until this day (YYYY-MM-DD). */ newUntil?: string };

/** Whether a story still carries its “New” label. */
export const isNew = (a: Story, now = Date.now()) => Boolean(a.newUntil && now < Date.parse(`${a.newUntil}T00:00:00Z`));

/** Where a story opens: its own page, or its news article. */
export const storyHref = (a: Story) => a.href ?? `/news/${a.slug}`;

/**
 * The Kpone Hospital laboratory renovation, handed over on 9 November 2026. In Featured news (home) and in News, Blog &
 * Press (Events & News), it opens its section on the CSR page, where the Citi Newsroom story is linked.
 */
export const kponeStory: Story = {
  slug: 'kpone-hospital-laboratory-renovation',
  title: 'Flokefama renovates and hands over the Laboratory Department at Kpone Hospital',
  date: '2026-11-09',
  categories: ['News'],
  excerpt: 'The renovated Laboratory Department at Kpone Hospital, handed over by Flokefama.',
  image: { src: '/images/csr/kpone-1.webp', alt: 'The renovated Kpone Hospital Laboratory Department', width: 1080, height: 720 },
  blocks: [],
  source: 'https://www.citinewsroom.com/2026/11/flokefama-renovates-hands-over-laboratory-department-at-kpone-hospital/',
  href: '/csr#kpone',
  // “New” for a month after the handover
  newUntil: '2026-12-09',
};
