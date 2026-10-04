import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { contact, maps } from '@/data/seed';

/** Compact footer: one row with the logo, the main pages and how to reach us; a thin legal row below. */
const pages = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Shop' },
  { href: '/events', label: 'Events' },
  { href: '/esg', label: 'ESG' },
  { href: '/contact', label: 'Contact' },
  { href: '/portal', label: 'Client portal' },
];

export function SiteFooter() {
  return (
    <footer className="bg-[linear-gradient(135deg,#1d2e36_0%,#16232a_55%,#10191e_100%)] text-white/80">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-10 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <Logo tone="dark" className="shrink-0" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {pages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded transition hover:text-white focus-visible:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <li><a href={contact.phoneHref} className="inline-flex items-center gap-2 hover:text-white"><Icon name="fi-rr-phone-call" className="text-brand-300" />{contact.phone}</a></li>
          <li><a href={`mailto:${contact.info}`} className="inline-flex items-center gap-2 hover:text-white"><Icon name="fi-rr-envelope" className="text-brand-300" />{contact.info}</a></li>
          <li><a href={maps.directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Icon name="fi-rr-marker" className="text-brand-300" />Santa Maria, Accra</a></li>
        </ul>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 border-t border-white/10 px-5 pb-24 pt-5 text-xs text-white/65 md:px-10 md:pb-5">
        <p>© {new Date().getFullYear()} Flokefama Company Limited. All rights reserved.</p>
        <p>Saving lives since 2008</p>
      </div>
    </footer>
  );
}
