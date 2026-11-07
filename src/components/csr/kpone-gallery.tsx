'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Viewer } from '@/components/events/event-gallery';
import type { CsrPhoto } from '@/data/csr';
import { cn } from '@/lib/utils';

/**
 * CSR page, Kpone Hospital: a video first when there is one, else the first photo large; the rest three to a row (two
 * on phones). Rows always end full: one photo left over takes the whole row, two left over share it. Any photo opens
 * the full-screen viewer (arrows, ← → Esc, or a swipe).
 */
export function KponeGallery({ photos, video, title }: { photos: CsrPhoto[]; video?: { src: string; poster?: string }; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const first = video ? 0 : 1;
  const n = photos.length - first;

  return (
    <>
      <ul aria-label={`Photos: ${title}`} className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {video && (
          <li className="col-span-2 md:col-span-6">
            {/* Until a cover photo is set in the Studio, the first photo is the cover */}
            <video controls preload="none" playsInline poster={video.poster || photos[0]?.src} title={`${title}: video`} className="aspect-video w-full bg-ink object-cover">
              <source src={video.src} type="video/mp4" />
            </video>
          </li>
        )}
        {photos.map((p, i) => {
          const lead = i === 0 && !video;
          const k = i - first;
          const wide = !lead && n % 3 === 1 && k === n - 1;
          const half = !lead && n % 3 === 2 && k >= n - 2;
          const phoneWide = !lead && n % 2 === 1 && k === n - 1;
          return (
            <li key={p.src} className={cn(lead ? 'col-span-2 md:col-span-6' : wide ? 'md:col-span-6' : half ? 'md:col-span-3' : 'md:col-span-2', phoneWide && 'col-span-2')}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open photo ${i + 1} of ${photos.length} full screen: ${p.alt}`}
                className={cn('group relative block w-full cursor-zoom-in overflow-hidden bg-mist', lead ? 'aspect-[16/9] lg:aspect-[2/1]' : wide ? 'aspect-[3/2] md:aspect-[2/1]' : 'aspect-[3/2]')}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={lead || wide ? '(min-width: 1280px) 1180px, 100vw' : half ? '(min-width: 768px) 600px, 50vw' : '(min-width: 768px) 400px, 50vw'}
                  className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                />
                <span aria-hidden className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            </li>
          );
        })}
      </ul>
      {open !== null && <Viewer photos={photos} start={open} title={title} onClose={() => setOpen(null)} />}
    </>
  );
}
