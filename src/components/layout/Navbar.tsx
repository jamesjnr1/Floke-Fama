'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

/** Center Nav Anchors (gap 32px, hidden on mobile). */
const anchors = [
  { href: '/products', label: 'Solutions' },
  { href: '/#partners', label: 'Technology Partners' },
  { href: '/#impact', label: 'Institutional Impact' },
  { href: '/#media', label: 'Media Hub' },
];

/** Pages that open on the dark canvas, so the header starts light-on-dark. */
const darkTop = ['/'];

/** Global Header: floating glass bar, 1280px max, 72px tall. */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
            : cn('border-line backdrop-blur-xl', scrolled ? 'bg-paper/90 shadow-[0_20px_50px_-30px_rgb(15_23_42/0.35)]' : 'bg-paper/70'),
        )}
      >
        <Logo tone={dark ? 'dark' : 'light'} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {anchors.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className={cn(
                    'relative text-sm transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100',
                    dark ? 'text-white/75 after:bg-neon-400 hover:text-white' : 'text-ink-2 after:bg-neon-600 hover:text-ink',
                    pathname === a.href && (dark ? 'text-white' : 'text-ink'),
                  )}
                >
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* CTA Button: padding 12px 24px, brand neon-blue, radius 12px */}
          <Link
            href="/portal"
            className="group hidden items-center gap-2 rounded-xl bg-neon-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgb(147_197_253/0.25),0_10px_30px_-10px_rgb(59_130_246/0.8)] transition hover:bg-neon-500 sm:inline-flex"
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
                    {item.label} <Icon name="fi-rr-arrow-small-right" className="text-neon-400" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={contact.phoneHref} className="mt-auto flex items-center gap-3 rounded-xl border border-white/10 p-4 font-mono text-sm text-white">
              <Icon name="fi-rr-phone-call" className="text-neon-400" /> {contact.phone}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
