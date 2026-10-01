'use client';

import { usePathname } from 'next/navigation';

/** Renders its children everywhere except the given paths (e.g. the footer contact block on /contact). */
export function HideOn({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  return paths.includes(pathname) ? null : <>{children}</>;
}
