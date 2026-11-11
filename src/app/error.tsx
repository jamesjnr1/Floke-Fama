'use client';

import { SiteErrorView } from '@/components/site-error-view';
import posthog from 'posthog-js';
import { useEffect } from 'react';

/** A page that breaks anywhere on the site or in a portal: see SiteErrorView. */
export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return <SiteErrorView error={error} reset={reset} />;
}
