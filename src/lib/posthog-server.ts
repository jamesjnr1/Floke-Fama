import 'server-only';

import { PostHog } from 'posthog-node';

let client: PostHog | null | undefined;

function getClient() {
  if (client !== undefined) return client;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) {
    if (process.env.NODE_ENV !== 'production') {
      if (!key) console.warn('NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured');
      if (!host) console.warn('NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured');
    }
    client = null;
    return client;
  }

  client = new PostHog(key, {
    host,
    enableExceptionAutocapture: true,
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: 2000,
    fetchRetryCount: 0,
  });
  return client;
}

/** Captures a short-lived route-handler event without delaying a completed app action on delivery failure. */
export async function captureServerEvent(distinctId: string, event: string, properties?: Record<string, string | number | boolean>) {
  const posthog = getClient();
  if (!posthog) return;
  try {
    posthog.capture({ distinctId, event, properties });
    await posthog.flush().catch(() => {});
  } catch {
    // Analytics must never fail the route handler's completed work.
  }
}
