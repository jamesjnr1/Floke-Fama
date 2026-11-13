'use client';

import { useEffect } from 'react';

/**
 * A product's full page always opens at its top. Opened from far down the shop (or while the shop's pop-up was still
 * loading), the browser could keep the shop's scroll position, and as a product page is shorter than the shop the
 * visitor landed at its bottom: the related products and the footer. A link to a part of the page (#…) is left alone.
 */
export function ScrollToTop() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  return null;
}
