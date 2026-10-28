/**
 * The URL a page header photo is shown from. Header photos skip on-demand image optimisation (the first
 * request for each size has to be encoded, which made headers appear late after clicking a tab): the
 * built-in photos are already compressed WebP files served straight from the CDN, and Studio uploads are
 * resized by Sanity's own image CDN.
 */
export const headerImageSrc = (src: string) =>
  src.startsWith('https://cdn.sanity.io/') ? `${src}${src.includes('?') ? '&' : '?'}w=2000&fm=webp&q=72` : src;

/**
 * Header photos that also come as a phone copy (`-m.webp`, at most 1000 px tall and more compressed), made with
 * `npm run header-images`. Phones show and preload that copy: a third to an eighth of the size.
 */
const phoneCopies = new Set([
  '/images/headers/about-microscopes.webp',
  '/images/headers/about-stethoscope.webp',
  '/images/headers/awards-cup.webp',
  '/images/headers/contact-support.webp',
  '/images/headers/esg-care.webp',
  '/images/headers/esg-volunteers.webp',
  '/images/headers/events-parade.webp',
  '/images/headers/login-hospital.webp',
  '/images/headers/services-technician.webp',
  '/images/headers/services.webp',
  '/images/headers/shop.webp',
  '/images/headers/support-agent.webp',
  '/images/headers/support-puzzle.webp',
  '/images/headers/support-team.webp',
  '/images/headers/team-engineers.webp',
  '/images/headers/team-lab.webp',
  '/images/awards/ghana-club-100-trophy.webp',
  '/images/news/flokefama-supports-zodf-ramadan-distribution-programme-cover.webp',
  '/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-1.webp',
  '/images/news/quality-verification-the-cornerstone-of-healthcare-excellence-in-ghana-cover.webp',
]);

/** The smaller copy of a header photo for phones (Studio uploads: Sanity resizes them). */
export const headerImagePhoneSrc = (src: string) =>
  src.startsWith('https://cdn.sanity.io/') ? `${src}${src.includes('?') ? '&' : '?'}h=1000&fm=webp&q=64` : phoneCopies.has(src) ? src.replace(/\.webp$/, '-m.webp') : src;
