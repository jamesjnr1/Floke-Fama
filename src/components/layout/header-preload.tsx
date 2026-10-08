'use client';

import { useEffect } from 'react';
import { useSite } from '@/components/site-provider';
import { headerImageSrc } from '@/lib/header-image';

/**
 * Once the first page has loaded and the browser is idle, fetch the other pages' header photos in the
 * background, so a tab's header shows straight away when it is clicked. Skipped on Data Saver and slow
 * connections.
 */
export function HeaderPreload() {
  const { pageHeaders } = useSite();
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return;
    const urls = [...new Set(Object.values(pageHeaders).map((h) => h.image).filter((x): x is string => Boolean(x)))].map(headerImageSrc);
    const run = () => urls.forEach((u) => { new Image().src = u; });
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const id = idle(run);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, [pageHeaders]);
  return null;
}
