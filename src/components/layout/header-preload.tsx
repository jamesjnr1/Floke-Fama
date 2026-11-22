'use client';

import { useEffect } from 'react';
import { useSite } from '@/components/site-provider';
import { codeHeaders, headerImagePhoneSrc, headerImageSrc } from '@/lib/header-image';

/**
 * Once the page has fully loaded (its own header photo included) and the browser is idle, fetch the other pages'
 * header photos in the background, so a tab's header shows straight away when it is clicked (phones fetch the
 * smaller copies). Started any earlier, these downloads shared the line with the page's own header and made it
 * appear seconds late on a slow connection. Skipped on Data Saver and on slow connections (2G, 3G, under 2 Mbps).
 */
export function HeaderPreload() {
  const { pageHeaders } = useSite();
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
    if (conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? '') || (conn?.downlink !== undefined && conn.downlink < 2)) return;
    const urls = [...new Set([...Object.values(pageHeaders).map((h) => h.image), ...codeHeaders].filter((x): x is string => Boolean(x)))].map(matchMedia('(max-width: 767px)').matches ? headerImagePhoneSrc : headerImageSrc);
    let id: number | undefined;
    const run = () => urls.forEach((u) => { const img = new Image(); img.fetchPriority = 'low'; img.src = u; });
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
    const start = () => { id = idle(run, { timeout: 8000 }); };
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
    return () => {
      removeEventListener('load', start);
      if (id !== undefined) (window.cancelIdleCallback ?? window.clearTimeout)(id);
    };
  }, [pageHeaders]);
  return null;
}
