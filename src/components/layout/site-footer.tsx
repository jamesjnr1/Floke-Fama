import Link from 'next/link';
import { SocialLinks } from '@/components/ui/social-links';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { getSite } from '@/lib/site';
import { telHref } from '@/lib/utils';

/** Footer: one plain dark colour with white and grey text only, the Flokefama logo and links to the real pages. */
const columns = [
  {
    title: 'Solutions',
    links: [
      { label: 'In-Vitro Diagnostics', href: '/products?category=in-vitro-diagnostics' },
      { label: 'Surgical & Theatre', href: '/products?category=surgical-theatre' },
      { label: 'Medical Equipment', href: '/products?category=medical-equipment' },
      { label: 'Medical Consumables', href: '/products?category=medical-consumables' },
      { label: 'Rapid Diagnostics', href: '/products?category=rapid-diagnostics' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Equipment Sales', href: '/services' },
      { label: 'Installation', href: '/support' },
      { label: 'Repairs & Parts', href: '/support' },
      { label: 'Training', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Events', href: '/events' },
      { label: 'CSR', href: '/esg' },
      { label: 'Technical support', href: '/support' },
      { label: 'Client portal', href: '/portal' },
    ],
  },
];

export async function SiteFooter() {
  const { contact, maps, branches } = await getSite();
  return (
    <footer className="border-t border-white/10 bg-[#10191e] text-white/70">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-3 lg:grid-cols-12 lg:gap-8 lg:py-10">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-3 lg:col-span-3">
            <Logo tone="dark" />
            <p className="text-sm text-white/75">Ghana’s No.1 healthcare company. <span className="font-semibold text-white">Saving lives since 2008.</span></p>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                  <MapPin className="size-4 shrink-0 text-white/50" aria-hidden /> Santa Maria, Accra, Ghana
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="size-4 shrink-0 text-white/50" aria-hidden /> {contact.phone} <span className="text-white/50">(24/7)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.support}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-white/50" aria-hidden /> {contact.support} <span className="text-white/50">(support)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.sales}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-white/50" aria-hidden /> {contact.sales} <span className="text-white/50">(sales)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.info}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-4 shrink-0 text-white/50" aria-hidden /> {contact.info}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5 lg:col-span-2">
              <h2 className="text-sm font-semibold text-white">{col.title}</h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 flex flex-col gap-2.5 md:col-span-3 lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Need equipment?</h2>
            <p className="text-sm">Order from the shop; sales confirms price and delivery.</p>
            <Link href="/products" className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
              Order equipment
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <SocialLinks className="mt-2" buttonClassName="text-white/75 hover:text-white" />
          </div>
        </div>

        {/* Every branch and its number, on every page, so a hospital can always reach the nearest one */}
        <nav aria-label="Branches" className="border-t border-white/10 py-6">
          <h2 className="text-sm font-semibold text-white">Our branches</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
            {branches.map((b) => (
              <li key={b.name}>
                <span className="block text-white/85">{b.name}</span>
                {b.phone ? (
                  <a href={telHref(b.phone)} className="transition-colors hover:text-white">{b.phone}</a>
                ) : (
                  <span className="text-white/50">{b.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* The company name across the full width, in the hero's Inter Black capitals */}
        <div aria-hidden className="@container mb-8 mt-4">
          <p className="font-wordmark whitespace-nowrap text-[17.5cqw] font-black uppercase leading-[0.8] tracking-[-0.08em] text-[#2d3539]">Floke Fama</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pb-24 pt-4 text-xs text-white/55 md:flex-row md:items-center md:justify-between md:pb-4">
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <p>© {new Date().getFullYear()} Flokefama Company Limited</p>
            <p>Ghana Club 100 · Forbes Africa · Mindray Best in IVD</p>
          </div>
          <p>Saving lives since 2008</p>
        </div>
      </div>
    </footer>
  );
}
