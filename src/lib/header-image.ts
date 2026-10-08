/**
 * The URL a page header photo is shown from. Header photos skip on-demand image optimisation (the first
 * request for each size has to be encoded, which made headers appear late after clicking a tab): the
 * built-in photos are already compressed WebP files served straight from the CDN, and Studio uploads are
 * resized by Sanity's own image CDN.
 */
export const headerImageSrc = (src: string) =>
  src.startsWith('https://cdn.sanity.io/') ? `${src}${src.includes('?') ? '&' : '?'}w=2000&fm=webp&q=72` : src;
