'use client';

import { SiteErrorView } from '@/components/site-error-view';

/** The last resort, when even the site's frame fails: the same message, in its own page. */
export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
        <SiteErrorView {...props} />
      </body>
    </html>
  );
}
