import Link from 'next/link';
import { SocialLinks } from '@/components/ui/social-links';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { getSite } from '@/lib/site';

/** Footer: one plain dark colour with white and grey text only, the Flokefama logo and links to the real pages. */
const columns = [
  {
    title: 'Solutions',
    links: [
      { label: 'In-Vitro Diagnostics', href: '/products?category=in-vitro-diagnostics' },
      { label: 'Critical Care', href: '/products?category=critical-care' },
      { label: 'Laboratory', href: '/products?category=laboratory' },
      { label: 'Consumables', href: '/products?category=consumables' },
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
      { label: 'CSR', href: '/csr' },
      { label: 'Technical support', href: '/support' },
      { label: 'Client portal', href: '/portal' },
    ],
  },
];

export async function SiteFooter() {
  const { contact, maps, text } = await getSite();
  return (
    <footer className="border-t border-white/10 bg-[#10191e] text-white/70">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-4 lg:grid-cols-12 lg:gap-8 lg:py-10">
          {/* Who we are: the logo, the company statement and the social links */}
          <div className="col-span-2 flex flex-col gap-4 md:col-span-4 lg:col-span-3">
            <Logo tone="dark" />
            <p className="max-w-[46ch] text-sm leading-relaxed text-white/75">
              {text.footer.statement}
            </p>
            <p className="text-sm font-semibold text-white/90">{text.footer.tagline}</p>
            <SocialLinks buttonClassName="text-white/75 hover:text-white" />
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

          {/* How to reach us, and the shop */}
          <div className="col-span-2 flex flex-col gap-2.5 md:col-span-1 lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 transition-colors hover:text-white">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden /> Santa Maria, Accra
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-start gap-2 transition-colors hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden /> {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.info}`} className="flex items-start gap-2 whitespace-nowrap transition-colors hover:text-white">
                  <Mail className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden /> {contact.info}
                </a>
              </li>
            </ul>
            <Link href="/products" className="group mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
              Request a quote
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* The company name across the full width, in the hero's Inter Black capitals */}
        <div aria-hidden className="@container mb-8 mt-4">
          {/* Drawn by CSS (content: attr), not as text: it is decoration (the page has the real logo and name), so screen
              readers and contrast checks leave it alone. Lighthouse counted it as low-contrast text (Nov 2026) */}
          <p data-wordmark="Floke Fama" className="font-wordmark whitespace-nowrap text-[17.5cqw] font-black uppercase leading-[0.8] tracking-[-0.08em] text-[#2d3539] before:content-[attr(data-wordmark)]" />
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pb-24 pt-4 text-xs text-white/55 lg:flex-row lg:items-center lg:justify-between lg:pb-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
            <p>© {new Date().getFullYear()} Flokefama Company Limited</p>
            <p>{text.footer.honours}</p>
          </div>
          <p>Saving lives since 2008</p>
        </div>
      </div>
    </footer>
  );
}
