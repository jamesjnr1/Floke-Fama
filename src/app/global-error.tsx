'use client';

import { SiteErrorView } from '@/components/site-error-view';
import posthog from 'posthog-js';
import { useEffect } from 'react';

/** The last resort, when even the site's frame fails: the same message, in its own page. */
export default function GlobalError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        <SiteErrorView error={error} reset={reset} />
      </body>
    </html>
  );
}
