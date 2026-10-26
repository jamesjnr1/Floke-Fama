import 'server-only';

/**
 * A small per-visitor limit for public forms, so a bot can't flood the inbox or the CRM. Counts live in this
 * server's memory: on Vercel each running instance keeps its own count, which still stops a burst from one visitor.
 */
const hits = new Map<string, number[]>();

/** True when `key` has already been used `max` times within `windowMs`; otherwise records this use. */
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.delete(hits.keys().next().value!);
  return false;
}

/** The visitor's address, as Vercel passes it on. */
export const clientIp = (req: Request) => (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
