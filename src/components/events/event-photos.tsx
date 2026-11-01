import Image from 'next/image';
import { Icon } from '@/components/ui/icon';
import type { EventPhoto } from '@/lib/types';

/**
 * Photos from one event, uploaded in the Studio (Events → the event → Event photos). Until the first photo is
 * uploaded, a row of placeholders shows where they will go.
 */
export function EventPhotos({ photos: list, title, large = false }: { photos?: EventPhoto[] | null; title: string; large?: boolean }) {
  const photos = list ?? [];
  const cols = large ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-4 lg:grid-cols-6';
  if (photos.length === 0) {
    return (
      <ul aria-label={`Photos from ${title}: coming soon`} className={`grid gap-2 md:gap-3 ${cols}`}>
        {Array.from({ length: large ? 3 : 6 }, (_, i) => (
          <li key={i} className={`grid aspect-[4/3] place-items-center border border-dashed border-line bg-mist/60 text-ink-3 ${large && i === 2 ? 'hidden md:grid' : ''} ${!large && i > 3 ? 'hidden lg:grid' : ''}`}>
            <span className="flex flex-col items-center gap-1 text-center text-[0.6875rem] font-medium uppercase tracking-[0.1em] md:text-xs">
              <Icon name="fi-rr-camera" className="text-lg md:text-xl" />
              <span className={large ? undefined : 'hidden md:inline'}>Photos coming soon</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul aria-label={`Photos from ${title}`} className={`grid gap-2 md:gap-3 ${cols}`}>
      {photos.map((p, i) => (
        <li key={`${p.src}-${i}`}>
          <figure>
            <a href={p.src} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden bg-mist">
              <Image src={p.src} alt={p.alt || `${title}, photo ${i + 1}`} fill sizes={large ? '(min-width: 768px) 33vw, 50vw' : '(min-width: 1024px) 200px, 25vw'} className="object-cover transition-transform duration-500 hover:scale-105" />
            </a>
            {large && p.caption && <figcaption className="mt-2 text-sm leading-snug text-ink-3">{p.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  );
}
