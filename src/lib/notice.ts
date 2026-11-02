/**
 * Choices for the maintenance strip (Studio: Site content → Maintenance notice). The Studio offers the same lists
 * (studio/schemas/index.ts): keep them in step. Icons are written out in full so `npm run icons` includes them.
 */
export const noticeIcons = [
  { value: 'fi-rr-tools', title: 'Tools (maintenance)' },
  { value: 'fi-rr-info', title: 'Information' },
  { value: 'fi-rr-megaphone', title: 'Announcement' },
  { value: 'fi-rr-triangle-warning', title: 'Warning' },
  { value: 'fi-rr-calendar', title: 'Calendar (event)' },
  { value: 'fi-rr-clock', title: 'Clock (opening hours)' },
  { value: 'fi-rr-phone-call', title: 'Phone' },
  { value: 'fi-rr-truck-side', title: 'Delivery' },
  { value: 'fi-rr-gift', title: 'Gift (offer)' },
  { value: 'fi-rr-party-horn', title: 'Celebration' },
  { value: 'fi-rr-heart', title: 'Heart' },
  { value: 'fi-rr-star', title: 'Star' },
  { value: 'fi-rr-shield-check', title: 'Shield (security)' },
  { value: 'fi-rr-stethoscope', title: 'Stethoscope' },
] as const;

/** Strip colours: white text reads on each. */
export const noticeColours = {
  green: '#087A48',
  red: '#C62A2F',
  dark: '#10231A',
  gold: '#8A5A00',
  blue: '#1D4ED8',
} as const;
export type NoticeColour = keyof typeof noticeColours;

/** A link the strip may show: a page on this site, a web address, a phone number or an email. Anything else is dropped. */
export function safeNoticeHref(href: string | undefined) {
  const h = (href ?? '').trim();
  if (!h) return null;
  if (/^\/(?!\/)/.test(h) || /^https?:\/\/[^\s]+$/i.test(h) || /^tel:\+?[\d\s-]{6,}$/i.test(h) || /^mailto:[^\s@]+@[^\s@]+$/i.test(h)) return h;
  return null;
}
