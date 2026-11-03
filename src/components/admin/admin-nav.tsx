'use client';

import Link, { useLinkStatus } from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * The admin console's menu, answering at once: the item you click lights up straight away and shows a small spinner
 * while the page loads (each section is loaded fresh from the database on the server, which takes a moment).
 */
const Chosen = createContext<{ chosen: string | null; choose: (id: string) => void }>({ chosen: null, choose: () => {} });

export function AdminNavProvider({ active, children }: { active: string; children: React.ReactNode }) {
  const [chosen, setChosen] = useState<string | null>(null);
  // The new page has arrived: what it says is open is the truth again
  useEffect(() => setChosen(null), [active]);
  return <Chosen.Provider value={{ chosen: chosen ?? active, choose: setChosen }}>{children}</Chosen.Provider>;
}

function Loading() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden className="ml-auto size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null;
}

export const navItemClass = (on: boolean) =>
  cn('relative flex items-center gap-3 rounded-xl px-3.5 py-[clamp(5px,0.9vh,11px)] text-[0.9375rem] font-medium transition-colors duration-100', on ? 'bg-white/[0.16] text-white shadow-[inset_3px_0_0_0_#fff]' : 'text-white/80 hover:bg-white/[0.08] hover:text-white');

export function AdminNavLink({ id, href, icon, label, badge }: { id: string; href: string; icon: string; label: string; badge?: React.ReactNode }) {
  const { chosen, choose } = useContext(Chosen);
  const on = chosen === id;
  return (
    <Link href={href} aria-current={on ? 'page' : undefined} onClick={() => choose(id)} className={navItemClass(on)}>
      <Icon name={icon} className={on ? 'text-white' : 'text-white/70'} /> {label}
      {badge}
      <Loading />
    </Link>
  );
}
