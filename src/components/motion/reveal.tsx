'use client';

import { motion, type HTMLMotionProps } from 'motion/react';

/**
 * Fade-and-rise when scrolled into view. Reduced motion (the OS setting or the site's own switch) is
 * handled by the MotionConfig in the accessibility provider: the rise is dropped and only a fade
 * remains. Always rendering the same element keeps server and client in step, so content can never
 * be left hidden at its starting opacity.
 */
export function Reveal({ delay = 0, y = 16, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  );
}
