'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * The admin console's menu, switching sections at once. Every section is already on the page (the server reads the
 * data for all of them in one go), so a click only shows that section and changes the address: nothing is fetched,
 * and Back and Forward work as usual. The page still reads the latest from the database every 30 seconds.
 *
 * A section that is not on the page (Database & settings, which asks the SMS and email services how they are), or any
 * click while the address carries a search or an opened record, is loaded from the server as before, with a
 * small spinner on the item while it loads.
 */
type Nav = { open: string; instant: (id: string) => boolean };
const NavContext = createContext<Nav>({ open: '', instant: () => false });

export function AdminNavProvider({ active, panes, fallback, exact, children }: {
  /** The section the server drew as open */
  active: string;
  /** The sections drawn on the page, which switch without the server */
  panes: string[];
  /** The section an address without ?tab= opens */
  fallback: string;
  /** The address has more than ?tab= (a search, an opened order or account), which only the server can draw */
  exact: boolean;
  children: React.ReactNode;
}) {
  // The address is the truth: the menu changes it with history.pushState, which Next.js turns into new search params
  // without asking the server
  const tab = useSearchParams().get('tab') ?? fallback;
  const open = panes.includes(tab) ? tab : active;
  // After a search or an opened record the page is drawn for that address, so the next click asks the server once;
  // from the page it brings back, the menu is instant again
  const instant = (id: string) => panes.includes(id) && !exact;
  return <NavContext.Provider value={{ open, instant }}>{children}</NavContext.Provider>;
}

/** A section of the console, shown while it is the open one. */
export function AdminPane({ id, children }: { id: string; children: React.ReactNode }) {
  const { open } = useContext(NavContext);
  return <div hidden={open !== id}>{children}</div>;
}

export const navItemClass = (on: boolean) =>
  cn('relative flex items-center gap-3 rounded-xl px-3.5 py-[clamp(5px,0.9vh,11px)] text-[0.9375rem] font-medium transition-colors duration-100', on ? 'bg-white/[0.16] text-white shadow-[inset_3px_0_0_0_#fff]' : 'text-white/80 hover:bg-white/[0.08] hover:text-white');

export function AdminNavLink({ id, href, icon, label, badge, className }: { id: string; href: string; icon: string; label: string; badge?: React.ReactNode; className?: string }) {
  const { open, instant } = useContext(NavContext);
  const [loading, setLoading] = useState(false);
  const on = open === id;
  return (
    <Link
      href={href}
      aria-current={on ? 'page' : undefined}
      onClick={(e) => {
        // A new tab or window (Ctrl, Cmd, Shift or the middle button) opens as usual
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        // Not on the page: load it from the server. A plain page load, because after the menu has changed the address
        // itself (or Back has been pressed) Next.js's own navigation can stay put.
        if (!instant(id)) {
          setLoading(true);
          window.location.assign(href);
          return;
        }
        if (!on) window.history.pushState(null, '', href);
        window.scrollTo({ top: 0 });
      }}
      className={cn(navItemClass(on), className)}
    >
      <Icon name={icon} className={on ? 'text-white' : 'text-white/70'} /> {label}
      {badge}
      {loading && <span aria-hidden className="ml-auto size-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
    </Link>
  );
}
