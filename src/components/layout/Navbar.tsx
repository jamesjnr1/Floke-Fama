'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
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
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);
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
            ? cn('border-white/10 backdrop-blur-xl', solid ? 'bg-midnight/90 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]' : 'bg-white/[0.04]')
            : cn('border-line backdrop-blur-xl', scrolled ? 'bg-paper/90 shadow-[0_20px_50px_-30px_rgb(11_21_16/0.35)]' : 'bg-paper/70'),
        )}
      >
        <Logo tone={dark ? 'dark' : 'light'} />

        {/* Hover: a soft glass pill glides between items (shared layoutId). No underline. */}
        <nav aria-label="Primary" className="hidden xl:block" onMouseLeave={() => { setHovered(null); setMenu(null); }}>
          <ul className="flex items-center">
            {anchors.map((a) => {
              const active = isActive(pathname, a);
              const itemClass = cn(
                'relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[0.875rem] transition-colors 2xl:px-3 2xl:text-sm duration-300 focus-visible:outline-none',
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
            href="/quote"
            className="hidden items-center whitespace-nowrap rounded-xl border border-white/15 px-3.5 py-3 text-[0.875rem] font-medium text-white 2xl:px-4 2xl:text-sm transition hover:border-white/30 hover:bg-white/[0.06] xl:inline-flex"
          >
            <Icon name="fi-rr-shopping-cart" className="mr-2 text-base" /> Cart
          </Link>
          {/* CTA Button: padding 12px 24px, brand green, radius 12px */}
          <Link
            href="/portal"
            className="group hidden items-center gap-2 whitespace-nowrap rounded-xl bg-cta px-4 py-3 text-[0.875rem] font-semibold text-white 2xl:px-6 2xl:text-sm transition hover:bg-cta-700 sm:inline-flex"
          >
            <span className="hidden 2xl:inline">Client Portal Access</span><span className="2xl:hidden">Client Portal</span>
          </Link>
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
            className="fixed inset-x-3 bottom-3 top-[92px] flex flex-col overflow-y-auto rounded-2xl border border-white/10 bg-midnight/95 p-5 backdrop-blur-xl xl:hidden"
          >
            <ul className="divide-y divide-white/10">
              {[...flat, { href: '/quote', label: 'Cart' }, { href: '/portal', label: 'Client Portal Access' }].map((item, i) => (
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
            <a href={contact.phoneHref} className="mt-auto flex items-center gap-3 rounded-xl border border-white/10 p-4 font-mono text-sm text-white">
              <Icon name="fi-rr-phone-call" className="text-brand-400" /> {contact.phone}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
