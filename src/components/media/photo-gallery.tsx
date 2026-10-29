import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import type { Photo } from '@/lib/site-content';

/**
 * A grid of photos with optional captions (engineering department, event albums), filled in the Studio. Square
 * photos, three to a row on wide screens, two on phones.
 */
export function PhotoGallery({ photos, label }: { photos: Photo[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
      {photos.map((p, i) => (
        <li key={`${p.src}-${i}`}>
          <Reveal delay={Math.min(i, 5) * 0.05}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
              </div>
              {p.caption && <figcaption className="mt-2 text-sm leading-snug text-ink-3">{p.caption}</figcaption>}
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
