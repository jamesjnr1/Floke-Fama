import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Logo, LogoWordmark } from '@/components/layout/logo';
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
      { label: 'CSR', href: '/esg' },
      { label: 'Technical support', href: '/support' },
      { label: 'Client portal', href: '/portal' },
    ],
  },
];

export async function SiteFooter() {
  const { contact, maps } = await getSite();
  return (
    <footer className="bg-[#022416] text-white/70">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-3 lg:grid-cols-12 lg:gap-8 lg:py-10">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-3 lg:col-span-3">
            <Logo tone="dark" />
            <p className="text-sm text-white/75">Ghana’s No.1 healthcare company.</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                  <MapPin className="size-4 shrink-0 text-white/50" aria-hidden /> Santa Maria, Accra, Ghana
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="size-4 shrink-0 text-white/50" aria-hidden /> {contact.phone}
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
            <p className="text-sm">Get a technical proposal for your facility.</p>
            <Link href="/quote" className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline">
              Request a quote
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* The company name across the full width */}
        <LogoWordmark className="mb-8 mt-4 h-auto w-full text-white/[0.12]" />

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
