'use client';

import { Children, useState } from 'react';

/** Shows the first `initial` news items, with "See more" to reveal the rest (as on youversion.com/newsroom). */
export function NewsMore({ initial, children }: { initial: number; children: React.ReactNode }) {
  const items = Children.toArray(children);
  const [all, setAll] = useState(false);
  return (
    <>
      <ul className="swipe-row mt-10 gap-x-6 gap-y-14 md:mt-14 md:grid-cols-2 lg:grid-cols-3">{all ? items : items.slice(0, initial)}</ul>
      {!all && items.length > initial && (
        <div className="mt-14 hidden justify-center md:flex">
          <button type="button" onClick={() => setAll(true)} className="h-11 border border-line px-6 text-sm font-medium text-ink transition hover:border-ink">
            See more
          </button>
        </div>
      )}
    </>
  );
}
