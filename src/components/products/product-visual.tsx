'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { IconTile } from '@/components/ui/icon';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Product image on a lit pedestal. Falls back to a branded icon plate until photography exists. */
export function ProductVisual({ product, category, className, sizes, priority, shared = true }: {
  product: Product;
  category?: Category;
  className?: string;
  sizes: string;
  priority?: boolean;
  shared?: boolean;
}) {
  const dark = product.image?.includes('bs-240-stage');
  return (
    <motion.div
      layoutId={shared ? `visual-${product.slug}` : undefined}
      className={cn(
        'relative isolate overflow-hidden rounded-[inherit]',
        dark ? 'bg-[radial-gradient(120%_90%_at_100%_100%,#132a1e_0%,#05090d_60%)]' : 'bg-[radial-gradient(90%_70%_at_50%_35%,#fff_0%,#f1f5f2_65%,#e6ece8_100%)]',
        className,
      )}
    >
      {product.image ? (
        <>
          {!dark && <div className="absolute inset-x-[22%] bottom-[10%] -z-10 h-[9%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(11_21_16/0.22),transparent)]" />}
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes={sizes}
            priority={priority}
            className={cn('object-contain transition-transform duration-1000 ease-out-expo group-hover:scale-105', dark ? 'object-right-bottom' : 'p-[14%] mix-blend-multiply')}
          />
        </>
      ) : (
        <div className="grid h-full place-items-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <IconTile name={category?.icon ?? 'fi-rr-box-open'} size="lg" />
            <p className="label">{product.brand}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
