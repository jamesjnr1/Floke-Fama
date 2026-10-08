'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProductVisual } from '@/components/products/product-visual';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

/** The main product photo with thumbnails for the other photos the shop shows. */
export function ProductGallery({ product, category, sizes, priority, shared, className, visualClassName, thumbsClassName }: {
  product: Product;
  category?: Category;
  sizes: string;
  priority?: boolean;
  shared?: boolean;
  className?: string;
  visualClassName?: string;
  thumbsClassName?: string;
}) {
  const photos = [product.image, ...(product.gallery ?? [])].filter((x): x is string => Boolean(x));
  const [active, setActive] = useState(0);
  const current = photos[active];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ProductVisual product={product} category={category} src={current} sizes={sizes} priority={priority} shared={shared} className={visualClassName} />
      {photos.length > 1 && (
        <ul className={cn('flex gap-2 overflow-x-auto pb-1', thumbsClassName)} aria-label={`${product.name} photos`}>
          {photos.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-current={i === active}
                className={cn(
                  'relative block size-16 overflow-hidden rounded-md border bg-white transition md:size-[72px]',
                  i === active ? 'border-brand-600 ring-2 ring-brand-100' : 'border-line hover:border-ink/30',
                )}
              >
                <Image src={src} alt="" fill sizes="72px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
