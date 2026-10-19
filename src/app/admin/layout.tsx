import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Flokefama Admin Console', robots: { index: false, follow: false } };

/** The admin console is an application shell: no marketing header or footer. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
