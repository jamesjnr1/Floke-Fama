'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type MenuChild = { href: string; label: string; hint: string; image: string };

/**
 * How the Company drop-down looks. 'classic' (default): the dark list. 'cards': a light panel with a photo card per page. 'mega': a full-width
 * panel under the bar with an introduction, the pages and the CEO's message. 'green': the pages numbered on the
 * company green. 'light': a plain white list.
 * Simplest, names only: 'white', 'dark' and 'greenlite' (small panels), 'strip' (a slim band under the bar).
 * Switch with NEXT_PUBLIC_MENU_STYLE in Vercel (then redeploy).
 */
const styles = ['cards', 'mega', 'green', 'light', 'classic', 'white', 'dark', 'greenlite', 'strip'] as const;
export type MenuStyle = (typeof styles)[number];
const env = process.env.NEXT_PUBLIC_MENU_STYLE as MenuStyle | undefined;
export const menuStyle: MenuStyle = env && styles.includes(env) ? env : 'classic';

const motionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
};
const shadow = 'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)]';

export function NavDropdown({ id, items, isOn, variant = menuStyle }: { id: string; items: MenuChild[]; isOn: (href: string) => boolean; variant?: MenuStyle }) {
  if (variant === 'mega') {
    return (
      <motion.div id={id} {...motionProps} className="fixed inset-x-0 top-[72px] pt-0">
        <div className={cn('border-t border-black/5 bg-white text-ink', shadow)}>
          <div className="mx-auto grid max-w-[1280px] gap-10 px-10 py-10 lg:grid-cols-[1fr_1.4fr_1fr]">
            <div>
              <p className="label">Company</p>
              <p className="mt-3 text-2xl font-bold leading-tight tracking-[-0.03em]">
                Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">Supplying, installing and supporting medical equipment across Ghana and West Africa since 2008.</p>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {items.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} aria-current={isOn(c.href) ? 'page' : undefined} className="group block">
                    <span className="relative block aspect-[16/10] overflow-hidden bg-canvas">
                      <Image src={c.image} alt="" fill sizes="260px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                    </span>
                    <span className="mt-3 flex items-center gap-2 text-lg font-bold tracking-[-0.02em] group-hover:text-brand-700">
                      {c.label} <i className="fi fi-rr-arrow-small-right transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-3">{c.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/about#ceo" className="group relative isolate flex min-h-[220px] overflow-hidden bg-midnight text-white">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt="" fill sizes="320px" className="-z-10 object-cover object-top opacity-80 transition-transform duration-700 group-hover:scale-[1.05]" />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
              <span className="mt-auto p-5">
                <span className="label block !text-brand-300">Leadership</span>
                <span className="mt-1 flex items-center gap-2 text-lg font-bold">
                  A message from our CEO <i className="fi fi-rr-arrow-small-right transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'cards') {
    return (
      <motion.div id={id} {...motionProps} className="absolute left-1/2 top-full w-[520px] -translate-x-1/2 pt-3">
        <ul className={cn('grid grid-cols-2 gap-2 bg-white p-2', shadow)}>
          {items.map((c) => (
            <li key={c.href}>
              <Link href={c.href} aria-current={isOn(c.href) ? 'page' : undefined} className="group block p-2 transition-colors hover:bg-canvas">
                <span className="relative block aspect-[16/10] overflow-hidden bg-canvas">
                  <Image src={c.image} alt="" fill sizes="240px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                </span>
                <span className="mt-3 flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-ink group-hover:text-brand-700">
                  {c.label}
                  {isOn(c.href) && <span aria-hidden className="size-1.5 rounded-full bg-brand-600" />}
                </span>
                <span className="mt-0.5 block pb-1 text-sm leading-snug text-ink-3">{c.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  if (variant === 'green') {
    return (
      <motion.div id={id} {...motionProps} className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-3">
        <ul className={cn('bg-[linear-gradient(160deg,#0a5a33_0%,#043822_100%)] p-3', shadow)}>
          {items.map((c, i) => (
            <li key={c.href}>
              <Link href={c.href} aria-current={isOn(c.href) ? 'page' : undefined} className={cn('group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-white/[0.08]', isOn(c.href) && 'bg-white/[0.06]')}>
                <span className="w-6 shrink-0 pt-1.5 text-sm font-semibold tabular-nums text-brand-300">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">
                  <span className="flex items-center justify-between text-lg font-bold tracking-[-0.02em] text-white">
                    {c.label}
                    <i className="fi fi-rr-arrow-small-right text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-sm text-white/75">{c.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  if (variant === 'light') {
    return (
      <motion.div id={id} {...motionProps} className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
        <ul className={cn('bg-white p-2', shadow)}>
          {items.map((c) => (
            <li key={c.href}>
              <Link href={c.href} aria-current={isOn(c.href) ? 'page' : undefined} className="group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-canvas">
                <span>
                  <span className={cn('block text-base font-bold tracking-[-0.02em]', isOn(c.href) ? 'text-brand-700' : 'text-ink group-hover:text-brand-700')}>{c.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-3">{c.hint}</span>
                </span>
                <i className="fi fi-rr-arrow-small-right text-lg text-ink-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-brand-700 group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  if (variant === 'strip') {
    return (
      <motion.div id={id} {...motionProps} className="fixed inset-x-0 top-[72px]">
        <ul className={cn('flex justify-center gap-2 bg-white py-3', shadow)}>
          {items.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                aria-current={isOn(c.href) ? 'page' : undefined}
                className={cn('block px-5 py-2 text-[0.9375rem] font-semibold transition-colors hover:bg-canvas hover:text-brand-700', isOn(c.href) ? 'text-brand-700' : 'text-ink')}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  if (variant === 'white' || variant === 'dark' || variant === 'greenlite') {
    const panel = { white: 'bg-white', dark: 'bg-midnight', greenlite: 'bg-brand-700' }[variant];
    const link = {
      white: 'text-ink hover:bg-canvas hover:text-brand-700',
      dark: 'text-white/85 hover:bg-white/[0.07] hover:text-white',
      greenlite: 'text-white/90 hover:bg-white/10 hover:text-white',
    }[variant];
    const on = { white: 'text-brand-700', dark: 'text-white', greenlite: 'text-white' }[variant];
    return (
      <motion.div id={id} {...motionProps} className="absolute left-1/2 top-full w-48 -translate-x-1/2 pt-3">
        <ul className={cn('p-1.5', panel, shadow)}>
          {items.map((c) => (
            <li key={c.href}>
              <Link href={c.href} aria-current={isOn(c.href) ? 'page' : undefined} className={cn('flex items-center justify-between px-4 py-2.5 text-[0.9375rem] font-medium transition-colors', link, isOn(c.href) && on)}>
                {c.label}
                {isOn(c.href) && <span aria-hidden className={cn('size-1.5 rounded-full', variant === 'white' ? 'bg-brand-600' : 'bg-brand-300')} />}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }

  // classic: the earlier dark list
  return (
    <motion.div id={id} {...motionProps} className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
      <ul className={cn('rounded-[4px] border border-white/10 bg-midnight p-2 backdrop-blur-xl', shadow)}>
        {items.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              aria-current={isOn(c.href) ? 'page' : undefined}
              className={cn('group flex items-center justify-between gap-3 rounded-[4px] px-4 py-3 transition hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none', isOn(c.href) && 'bg-white/[0.04]')}
            >
              <span>
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  {c.label} {isOn(c.href) && <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />}
                </span>
                <span className="block text-xs text-white/75">{c.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
