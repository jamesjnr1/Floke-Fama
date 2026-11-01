import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { demoOn } from '@/lib/demo';
import { siteUrl } from '@/lib/utils';

/**
 * The demo link's code: DEMO_CODE when set (12+ characters), otherwise one derived from SESSION_SECRET, so the demo
 * works without setting anything. Null when the demo is off (DEMO=off, past DEMO_UNTIL) or there is no stable secret.
 */
export function demoCode(): string | null {
  if (!demoOn()) return null;
  const fixed = process.env.DEMO_CODE?.trim();
  if (fixed) return fixed.length >= 12 ? fixed : null;
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return createHmac('sha256', secret).update('flokefama-demo-v1').digest('base64url').slice(0, 20);
}

export function isDemoCode(given: string | undefined | null) {
  const want = demoCode();
  if (!want || !given || given.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(want));
}

export const demoLink = () => {
  const code = demoCode();
  return code ? `${siteUrl}/demo?code=${encodeURIComponent(code)}` : null;
};
