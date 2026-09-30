'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

/** Primary navigation: each tab is its own page. */
const anchors = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/partners', label: 'Technology Partners' },
  { href: '/impact', label: 'Institutional Impact' },
  { href: '/media', label: 'Media Hub' },
];

/** Pages that open on the dark canvas, so the header starts light-on-dark. */
const darkTop = ['/', '/solutions', '/partners', '/impact', '/media'];

/** A tab stays active on its sub-pages too (e.g. /solutions/...). */
const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Global Header: floating glass bar, 1280px max, 72px tall. */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const dark = open || darkTop.includes(pathname);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={cn(
          'mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-6 rounded-2xl border px-4 transition-[background-color,border-color,box-shadow] duration-500 md:px-6',
          dark
            ? cn('border-white/10 backdrop-blur-xl', scrolled || open ? 'bg-midnight/85 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]' : 'bg-white/[0.04]')
            : cn('border-line backdrop-blur-xl', scrolled ? 'bg-paper/90 shadow-[0_20px_50px_-30px_rgb(11_21_16/0.35)]' : 'bg-paper/70'),
        )}
      >
        <Logo tone={dark ? 'dark' : 'light'} />

        {/* Hover: a soft glass pill glides between items (shared layoutId). No underline. */}
        <nav aria-label="Primary" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
          <ul className="flex items-center gap-1">
            {anchors.map((a) => {
              const active = isActive(pathname, a.href);
              return (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    aria-current={active ? 'page' : undefined}
                    onMouseEnter={() => setHovered(a.href)}
                    onFocus={() => setHovered(a.href)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      'relative block rounded-full px-4 py-2 text-sm transition-colors duration-300 focus-visible:outline-none',
                      dark ? 'text-white/70 hover:text-white' : 'text-ink-2 hover:text-ink',
                      active && (dark ? 'text-white' : 'text-ink'),
                    )}
                  >
                    {hovered === a.href && (
                      <motion.span
                        layoutId="nav-hover"
                        aria-hidden
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                        className={cn(
                          'absolute inset-0 rounded-full',
                          dark
                            ? 'bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ring-1 ring-white/10'
                            : 'bg-ink/[0.045] ring-1 ring-ink/[0.06]',
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA Button: padding 12px 24px, brand green, radius 12px */}
          <Link
            href="/portal"
            className="group hidden items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgb(143_209_169/0.25),0_10px_30px_-10px_rgb(46_154_91/0.8)] transition hover:bg-brand-700 sm:inline-flex"
          >
            Client Portal Access <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn('relative size-11 rounded-xl border lg:hidden', dark ? 'border-white/15 text-white' : 'border-line text-ink')}
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
            className="fixed inset-x-3 bottom-3 top-[92px] flex flex-col rounded-2xl border border-white/10 bg-midnight/95 p-5 backdrop-blur-xl lg:hidden"
          >
            <ul className="divide-y divide-white/10">
              {[...anchors, { href: '/portal', label: 'Client Portal Access' }, { href: '/quote', label: 'Request a quote' }].map((item, i) => (
                <motion.li key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={item.href} className="flex items-center justify-between py-4 text-xl font-medium text-white">
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
