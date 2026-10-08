'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ProductGallery } from '@/components/products/product-gallery';
import { SpecActions, SpecHeader, SpecTabs } from '@/components/products/spec-sheet';
import { Icon } from '@/components/ui/icon';
import type { Category, Product } from '@/lib/types';

/** Deep Spec Sheet overlay (intercepted route). Closing returns to the catalogue exactly as it was. */
export function SpecModal({ product, category }: { product: Product; category?: Category }) {
  const router = useRouter();
  return (
    <Dialog.Root defaultOpen onOpenChange={(open) => !open && router.back()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-midnight/60 backdrop-blur-md" />
        </Dialog.Overlay>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-3 bottom-3 top-16 z-[70] mx-auto max-w-6xl overflow-hidden rounded-5xl bg-canvas shadow-2xl outline-none md:inset-x-6 md:bottom-6 md:top-24"
        >
          <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
          <div className="grid h-full overflow-y-auto lg:grid-cols-[1fr_1.1fr] lg:overflow-hidden">
            <div className="relative lg:h-full">
              <ProductGallery product={product} category={category} sizes="(min-width: 1024px) 50vw, 100vw" priority className="lg:h-full lg:pb-4" visualClassName="min-h-[300px] flex-1 rounded-none" thumbsClassName="px-4" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0 space-y-8 p-6 md:p-10 lg:overflow-y-auto"
            >
              <SpecHeader product={product} categoryTitle={category?.title} />
              <SpecActions product={product} />
              <SpecTabs product={product} categoryTitle={category?.title} />
            </motion.div>
          </div>
          <Dialog.Close className="glass-light absolute right-4 top-4 grid size-11 place-items-center rounded-full text-ink shadow-sm transition hover:bg-white" aria-label="Close">
            <Icon name="fi-rr-cross-small" className="text-lg" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
