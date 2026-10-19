'use client';

import { MotionConfig } from 'motion/react';

/** Animations follow the device's "reduce motion" setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
