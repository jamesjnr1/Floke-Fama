'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';

/** Thin brand-green bar along the top that fills as the reader scrolls the article. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-brand-500" />;
}

/** Share an article: WhatsApp, LinkedIn, or copy the link. Uses the address the reader is on. */
export function ShareButtons({ title }: { title: string }) {
  const url = () => (typeof window === 'undefined' ? '' : window.location.href);
  const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');
  const btn = 'grid size-10 place-items-center rounded-full border border-line bg-paper text-ink-2 transition hover:border-brand-300 hover:text-brand-700';
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} aria-label="Share on WhatsApp" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`)}>
        <Icon name="fi-brands-whatsapp" />
      </button>
      <button type="button" className={btn} aria-label="Share on LinkedIn" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`)}>
        <Icon name="fi-brands-linkedin" />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            toast.success('Link copied');
          } catch {
            toast.error('Couldn’t copy the link');
          }
        }}
      >
        <Icon name="fi-rr-link-alt" />
      </button>
    </div>
  );
}
