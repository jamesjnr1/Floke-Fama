'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * What a visitor sees when a page breaks, instead of a blank screen: a short apology, Try again and Home. An error
 * that happened only in the browser is reported to Site health (errors on the server are recorded there already,
 * and carry a `digest`).
 */
export function SiteErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (error.digest) return;
    fetch('/api/site-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `${error.name && error.name !== 'Error' ? `${error.name}: ` : ''}${error.message}`, path: location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);
  return (
    <main id="main" style={{ minHeight: '70svh', display: 'grid', placeItems: 'center', padding: '120px 20px 60px', textAlign: 'center', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#10191e' }}>Something went wrong on this page.</h1>
        <p style={{ marginTop: 12, color: '#5b6670', lineHeight: 1.6 }}>We’ve been notified and will look into it. Please try again, or call us on +233 53 339 2863.</p>
        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={{ height: 46, padding: '0 22px', background: '#00703a', color: '#fff', fontWeight: 600, border: 0, cursor: 'pointer' }}>Try again</button>
          <Link href="/" style={{ height: 46, padding: '0 22px', display: 'inline-flex', alignItems: 'center', border: '1px solid #d5dbd8', color: '#10191e', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
        </div>
      </div>
    </main>
  );
}
