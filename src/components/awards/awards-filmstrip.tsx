'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { AwardItem } from '@/components/awards/awards-layouts';

/** A horizontal strip of tall award cards that scrolls (swipe, trackpad or the arrows). */
export function AwardsFilmstrip({ awards }: { awards: AwardItem[] }) {
  const row = useRef<HTMLUListElement>(null);
  const move = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <>
      <div className="mt-8 flex justify-end gap-2 md:-mt-14">
        <button type="button" onClick={() => move(-1)} aria-label="Previous awards" className="grid size-12 place-items-center border border-white/30 text-white transition-colors hover:bg-white hover:text-brand-800">
          <i className="fi fi-rr-arrow-small-left text-xl" aria-hidden />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="More awards" className="grid size-12 place-items-center bg-white text-brand-800 transition-colors hover:bg-white/85">
          <i className="fi fi-rr-arrow-small-right text-xl" aria-hidden />
        </button>
      </div>
      <ul ref={row} className="swipe-row mt-8 md:!flex md:snap-x md:snap-mandatory md:gap-5 md:!overflow-x-auto md:pb-2">
        {awards.map((a) => (
          <li key={a.id} className="md:!w-[340px] md:shrink-0">
            <div className="relative aspect-[3/4] overflow-hidden bg-white">
              <Image src={a.image} alt={a.alt} fill sizes="340px" className="object-cover object-[50%_35%]" />
            </div>
            <p className="label mt-5 !text-brand-300">{a.year}</p>
            <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-white">{a.title}</h3>
            <p className="no-justify mt-2 leading-relaxed text-white/70">{a.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
