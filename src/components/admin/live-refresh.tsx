'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Reads the page again from the server every `seconds` while the tab is open and visible. */
export function LiveRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
