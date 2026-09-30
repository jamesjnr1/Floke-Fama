'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

/** Fade-and-rise when scrolled into view. Content renders visible when motion is reduced. */
export function Reveal({ delay = 0, y = 24, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <motion.div {...props} />;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  );
}
