'use client';

import { SiteErrorView } from '@/components/site-error-view';

/** A page that breaks anywhere on the site or in a portal: see SiteErrorView. */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SiteErrorView {...props} />;
}
