'use client';

import { Children, useState } from 'react';

/** Shows the first `initial` news items, with "Show more" to reveal the rest, on every screen size. */
export function NewsMore({ initial, children }: { initial: number; children: React.ReactNode }) {
  const items = Children.toArray(children);
  const [all, setAll] = useState(false);
  return (
    <>
      <ul className="swipe-row mt-6 gap-4 md:mt-8 md:gap-6 md:grid-cols-2 lg:grid-cols-3">{all ? items : items.slice(0, initial)}</ul>
      {!all && items.length > initial && (
        <div className="mt-10 flex justify-center md:mt-14">
          <button type="button" onClick={() => setAll(true)} className="h-11 border border-line px-6 text-sm font-medium text-ink transition hover:border-ink">
            Show more ({items.length - initial})
          </button>
        </div>
      )}
    </>
  );
}
