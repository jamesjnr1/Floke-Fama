'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { logout } from '@/lib/auth/actions';
import { roleHome } from '@/lib/auth/session';
import { useSession } from '@/lib/auth/use-session';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; children?: { href: string; label: string; hint: string }[] };

/** Primary navigation, matching the menu on flokefama.com. Each tab is its own page. */
const anchors: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/about',
    label: 'Company',
    children: [
      { href: '/about', label: 'About Us', hint: 'Our story, mission and values' },
      { href: '/awards', label: 'Awards', hint: 'No.1 in Healthcare, Ghana Club 100' },
    ],
  },
  { href: '/services', label: 'Products & Services' },
  { href: '/events', label: 'Events & Activities' },
  { href: '/products', label: 'Shop' },
  { href: '/esg', label: 'ESG' },
  { href: '/contact', label: 'Contact' },
];

/** Flat list for the mobile menu. */
const flat = anchors.flatMap((a) => a.children?.map(({ href, label }) => ({ href, label })) ?? [{ href: a.href, label: a.label }]);

// Pages that open on a dark hero: the bar stays see-through there. Elsewhere it is solid from the start.
const darkTop = ['/portal'];

/** A tab stays active on its sub-pages too (e.g. /products/...). Home only matches exactly. */
const matches = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
const isActive = (pathname: string, item: NavItem) => (item.children ? item.children.some((c) => matches(pathname, c.href)) : matches(pathname, item.href));

/** Global Header: floating glass bar, 1280px max, 72px tall. */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [account, setAccount] = useState(false);
  const session = useSession();
  const user = session.user;
  const initials = user?.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const home = user ? roleHome[user.role] : '/login';
  const homeLabel = user?.role === 'engineer' ? 'Engineer portal' : 'Hospital dashboard';
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  useEffect(() => {
    setOpen(false);
    setMenu(null);
    setAccount(false);
  }, [pathname]);
  useEffect(() => {
    if (!account) return;
    const close = () => setAccount(false);
    const t = setTimeout(() => document.addEventListener('click', close, { once: true }));
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [account]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  // The header is always the dark glass bar; on pages that open light it is solid from the start.
  const dark = true;
  const solid = open || scrolled || !darkTop.includes(pathname);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={cn(
          'mx-auto flex h-[72px] max-w-[1280px] items-center 2xl:max-w-[1400px] justify-between gap-6 rounded-2xl border px-4 transition-[background-color,border-color,box-shadow] duration-500 md:px-6',
          dark
            ? cn('border-white/10', solid ? 'bg-midnight/[0.97] shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]' : 'bg-midnight/40')
            : cn('border-line', scrolled ? 'bg-paper/[0.97] shadow-[0_20px_50px_-30px_rgb(11_21_16/0.35)]' : 'bg-paper/90'),
        )}
      >
        <Logo tone={dark ? 'dark' : 'light'} />

        {/* Hover: a soft glass pill glides between items (shared layoutId). No underline. */}
        <nav aria-label="Primary" className="hidden xl:block" onMouseLeave={() => { setHovered(null); setMenu(null); }}>
          <ul className="flex items-center">
            {anchors.map((a) => {
              const active = isActive(pathname, a);
              const itemClass = cn(
                'relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[1rem] transition-colors 2xl:px-3 2xl:text-sm duration-300 focus-visible:outline-none',
                dark ? 'text-white/80 hover:text-white' : 'text-ink-2 hover:text-ink',
                active && (dark ? 'text-white' : 'text-ink'),
              );
              const inner = (
                <>
                  {hovered === a.label && (
                    <motion.span
                      layoutId="nav-hover"
                      aria-hidden
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                      className={cn(
                        'absolute inset-0 rounded-full',
                        dark ? 'bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ring-1 ring-white/10' : 'bg-ink/[0.045] ring-1 ring-ink/[0.06]',
                      )}
                    />
                  )}
                  {active && !hovered && (
                    <motion.span layoutId="nav-active" aria-hidden className={cn('absolute inset-0 rounded-full', dark ? 'bg-white/[0.06]' : 'bg-ink/[0.04]')} />
                  )}
                  <span className="relative flex items-center gap-2">
                    {active && <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />}
                    {a.label}
                  </span>
                </>
              );
              return (
                <li key={a.label} className="relative" onMouseEnter={() => { setHovered(a.label); setMenu(a.children ? a.label : null); }}>
                  {a.children ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={menu === a.label}
                        aria-controls={`menu-${a.label}`}
                        onClick={() => setMenu((m) => (m === a.label ? null : a.label))}
                        onFocus={() => setHovered(a.label)}
                        className={itemClass}
                      >
                        {inner}
                        <Icon name="fi-rr-angle-small-down" className={cn('relative transition-transform duration-300', menu === a.label && 'rotate-180')} />
                      </button>
                      <AnimatePresence>
                        {menu === a.label && (
                          <motion.div
                            id={`menu-${a.label}`}
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3"
                          >
                            <ul className="rounded-2xl border border-white/10 bg-midnight p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl">
                              {a.children.map((c) => {
                                const on = matches(pathname, c.href);
                                return (
                                  <li key={c.href}>
                                    <Link
                                      href={c.href}
                                      aria-current={on ? 'page' : undefined}
                                      className={cn('group flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none', on && 'bg-white/[0.04]')}
                                    >
                                      <span>
                                        <span className="flex items-center gap-2 text-sm font-medium text-white">
                                          {c.label} {on && <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />}
                                        </span>
                                        <span className="block text-xs text-white/75">{c.hint}</span>
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={a.href}
                      aria-current={active ? 'page' : undefined}
                      onFocus={() => { setHovered(a.label); setMenu(null); }}
                      onBlur={() => setHovered(null)}
                      className={itemClass}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="hidden items-center whitespace-nowrap rounded-xl border border-white/15 px-3.5 py-3 text-[1rem] font-medium text-white 2xl:px-4 2xl:text-sm transition hover:border-white/30 hover:bg-white/[0.06] xl:inline-flex"
          >
            <Icon name="fi-rr-shopping-cart" className="mr-2 text-base" /> Cart
          </Link>
          {user ? (
            /* Signed in: the account menu replaces the portal button */
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccount((a) => !a)}
                aria-expanded={account}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-xl border border-white/15 py-2 pl-2 pr-3.5 text-white transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold">{initials}</span>
                <span className="max-w-[9rem] truncate text-[1rem] font-medium">{user.name.split(' ')[0]}</span>
                <Icon name="fi-rr-angle-small-down" className={cn('transition-transform', account && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {account && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/10 bg-midnight p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
                  >
                    <div className="px-3 py-2.5">
                      {user.facility && <p className="text-sm font-semibold leading-snug text-brand-300">{user.facility}</p>}
                      <p className="truncate font-semibold text-white">{user.name}</p>
                      <p className="truncate text-sm text-white/65">{user.email}</p>
                    </div>
                    <Link role="menuitem" href={home} className="block rounded-xl px-3 py-2.5 text-[1rem] text-white/85 hover:bg-white/[0.06] hover:text-white">{homeLabel}</Link>
                    <Link role="menuitem" href="/checkout" className="block rounded-xl px-3 py-2.5 text-[1rem] text-white/85 hover:bg-white/[0.06] hover:text-white">Cart &amp; checkout</Link>
                    <form action={logout}>
                      <button role="menuitem" type="submit" className="w-full rounded-xl px-3 py-2.5 text-left text-[1rem] text-white/85 hover:bg-white/[0.06] hover:text-white">Sign out</button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-xl bg-cta px-4 py-3 text-[1rem] font-semibold text-white 2xl:px-6 2xl:text-sm transition hover:bg-cta-700 sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn('relative size-11 rounded-xl border xl:hidden', dark ? 'border-white/15 text-white' : 'border-line text-ink')}
          >
            <span className={cn('absolute left-3 right-3 h-[1.5px] rounded bg-current transition-all duration-500 ease-out-expo', open ? 'top-[21px] rotate-45' : 'top-[17px]')} />
            <span className={cn('absolute left-3 right-3 h-[1.5px] rounded bg-current transition-all duration-500 ease-out-expo', open ? 'top-[21px] -rotate-45' : 'top-[25px]')} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
            className="fixed inset-x-3 bottom-3 top-[92px] flex flex-col overflow-y-auto rounded-2xl border border-white/10 bg-midnight/95 p-5 backdrop-blur-xl xl:hidden"
          >
            <ul className="divide-y divide-white/10">
              {[...flat, { href: '/checkout', label: 'Cart' }, user ? { href: home, label: homeLabel } : { href: '/login', label: 'Sign in' }].map((item, i) => (
                <motion.li key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link
                    href={item.href}
                    aria-current={matches(pathname, item.href) ? 'page' : undefined}
                    className="flex items-center justify-between py-3.5 text-lg font-medium text-white aria-[current=page]:text-brand-300"
                  >
                    {item.label} <Icon name="fi-rr-arrow-small-right" className="text-brand-400" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            {user && (
              <form action={logout} className="mt-4">
                <button type="submit" className="flex w-full items-center justify-between rounded-xl border border-white/10 p-4 text-left text-white">
                  <span><span className="block font-semibold">{user.name}</span><span className="text-sm text-white/65">Sign out</span></span>
                  <Icon name="fi-rr-sign-out-alt" className="text-brand-300" />
                </button>
              </form>
            )}
            <a href={contact.phoneHref} className="mt-auto flex items-center gap-3 rounded-xl border border-white/10 p-4 font-mono text-sm text-white">
              <Icon name="fi-rr-phone-call" className="text-brand-400" /> {contact.phone}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
