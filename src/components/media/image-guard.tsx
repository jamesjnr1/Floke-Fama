'use client';

import { useEffect } from 'react';

/**
 * Discourages copying the site's photos and videos (the CEO, Oct 2026): no right-click menu, dragging or
 * long-press "Save image" on them. Screenshots can't be stopped by any website; this removes the easy ways.
 * Text, links and form fields keep their normal right-click menu.
 */
export function ImageGuard() {
  useEffect(() => {
    const media = (t: EventTarget | null) => t instanceof Element && Boolean(t.closest('img, video, picture, svg image, [data-protect]'));
    const block = (e: Event) => {
      if (media(e.target)) e.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);
  return null;
}
