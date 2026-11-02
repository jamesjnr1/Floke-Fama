'use client';

import { MotionConfig } from 'motion/react';
import '@/lib/zod-browser';

/** Animations follow the device's "reduce motion" setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
