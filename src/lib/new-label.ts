/**
 * The red “New” label: on a news story for a month from its date, and on a product or an event for a month from when it
 * was added in the Studio. After that it goes by itself (the pages are redrawn every 10 minutes; Events daily).
 */
export const NEW_FOR_DAYS = 30;

/** Whether something dated `iso` (YYYY-MM-DD or a full timestamp) is still new. */
export function isNewSince(iso: string | undefined | null, now = Date.now()) {
  if (!iso) return false;
  const t = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso);
  return Number.isFinite(t) && t <= now && now - t < NEW_FOR_DAYS * 86_400_000;
}
