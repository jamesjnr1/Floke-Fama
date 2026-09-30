'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/products', label: 'Products' },
  { href: '/#services', label: 'Services' },
  { href: '/#trust', label: 'Company' },
  { href: '/portal', label: 'Client portal' },
];

/** Pages whose top section is dark, so the header starts in its light-on-dark state. */
const darkTop = ['/', '/portal'];

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const onDark = darkTop.includes(pathname) && !scrolled && !open;
  const solidDark = open || (darkTop.includes(pathname) && scrolled);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500',
        solidDark && 'border-white/10 bg-midnight/90 backdrop-blur-xl',
        !solidDark && scrolled && 'border-line bg-canvas/80 backdrop-blur-xl',
        !scrolled && !open && 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-6 px-5 md:px-10">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className={cn('flex items-center gap-1 rounded-full p-1 transition-colors', onDark || solidDark ? 'glass' : 'border border-line bg-paper/70 backdrop-blur')}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative block rounded-full px-4 py-2 text-sm transition-colors',
                      onDark || solidDark ? 'text-white/70 hover:text-white' : 'text-ink-3 hover:text-ink',
                      active && (onDark || solidDark ? 'text-white' : 'text-ink'),
                    )}
                  >
                    {active && <motion.span layoutId="nav-pill" className={cn('absolute inset-0 rounded-full', onDark || solidDark ? 'bg-white/10' : 'bg-mist')} />}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a href={contact.phoneHref} className={cn('hidden items-center gap-2 text-sm font-medium xl:flex', onDark || solidDark ? 'text-white' : 'text-ink')}>
            <Icon name="fi-rr-phone-call" className="text-surgical-400" /> {contact.phone}
          </a>
          <Button asChild size="sm" variant={onDark || solidDark ? 'glow' : 'primary'} className="hidden sm:inline-flex">
            <Link href="/quote">Request a quote</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn('relative size-11 rounded-full lg:hidden', onDark || solidDark ? 'glass text-white' : 'border border-line bg-paper text-ink')}
          >
            <span className={cn('absolute left-3.5 right-3.5 h-[1.5px] rounded bg-current transition-all duration-500 ease-out-expo', open ? 'top-[21px] rotate-45' : 'top-[18px]')} />
            <span className={cn('absolute left-3.5 right-3.5 h-[1.5px] rounded bg-current transition-all duration-500 ease-out-expo', open ? 'top-[21px] -rotate-45' : 'top-[25px]')} />
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
            className="fixed inset-x-0 bottom-0 top-20 flex flex-col bg-midnight px-5 pb-8 pt-4 lg:hidden"
          >
            <ul className="divide-y divide-white/10">
              {[...nav, { href: '/quote', label: 'Request a quote' }].map((item, i) => (
                <motion.li key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={item.href} className="flex items-center justify-between py-5 text-2xl font-medium text-white">
                    {item.label} <Icon name="fi-rr-arrow-small-right" className="text-surgical-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={contact.phoneHref} className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 p-4 text-white">
              <Icon name="fi-rr-phone-call" className="text-surgical-300" /> {contact.phone}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
