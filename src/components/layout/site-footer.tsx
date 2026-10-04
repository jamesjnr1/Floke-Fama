import Link from 'next/link';
import { ArrowUpRight, HeartPulse, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { contact, maps } from '@/data/seed';

/** Footer in the FLOKE_BOLT layout, with the original Flokefama logo and links to the real pages. */
const columns = [
  {
    title: 'Solutions',
    links: [
      { label: 'In-Vitro Diagnostics', href: '/products?category=in-vitro-diagnostics' },
      { label: 'Patient Monitoring & Critical Care', href: '/products?category=critical-care' },
      { label: 'Laboratory Equipment', href: '/products?category=laboratory' },
      { label: 'Reagents & Consumables', href: '/products?category=consumables' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Equipment Sales', href: '/services' },
      { label: 'Installation & Calibration', href: '/services' },
      { label: 'Repairs & Spare Parts', href: '/services' },
      { label: 'Training & Capacity Building', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Flokefama', href: '/about' },
      { label: 'Events & Activities', href: '/events' },
      { label: 'ESG', href: '/esg' },
      { label: 'Contact', href: '/contact' },
      { label: 'Client portal', href: '/portal' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#10191e] text-white/75">
      <div aria-hidden className="absolute bottom-0 right-0 size-[420px] rounded-full bg-[#0d9ba8]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:col-span-3">
            <Logo tone="dark" />
            <p className="max-w-sm text-base leading-relaxed text-white/75">
              Ghana’s No.1 healthcare company. Total healthcare solutions for hospitals and laboratories across Ghana and West Africa. Saving lives since 2008.
            </p>
            <ul className="flex flex-col gap-3 text-base">
              <li>
                <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-white">
                  <MapPin className="size-5 shrink-0 text-[#54cdd6]" aria-hidden /> Santa Maria, Accra, Ghana
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Phone className="size-5 shrink-0 text-brand-300" aria-hidden /> {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.info}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <Mail className="size-5 shrink-0 text-[#ff8a8a]" aria-hidden /> {contact.info}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-4 lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#54cdd6]">{col.title}</h2>
              <ul className="flex flex-col gap-3 text-base">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-brand-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-4 border border-[#54cdd6]/20 bg-gradient-to-br from-[#16262d] to-[#0b3b40] p-6">
              <HeartPulse className="size-7 text-brand-300" strokeWidth={1.6} aria-hidden />
              <p className="text-lg font-bold leading-snug text-white">Get a technical proposal for your facility.</p>
              <Link href="/quote" className="group flex items-center justify-between gap-4 bg-cta px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-cta-700">
                Start Request
                <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pb-24 pt-6 text-sm md:flex-row md:items-center md:justify-between md:pb-6">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <li className="text-white/60">© {new Date().getFullYear()} Flokefama Company Limited</li>
            <li className="border-l border-white/15 pl-4 font-semibold text-brand-300">Ghana Club 100</li>
            <li className="border-l border-white/15 pl-4 font-semibold text-brand-300">Forbes Africa</li>
            <li className="border-l border-white/15 pl-4 font-semibold text-[#54cdd6]">Mindray Best in IVD</li>
          </ul>
          <p className="flex items-center gap-2 text-white/60">
            <HeartPulse className="size-4 text-[#ff6b6b]" aria-hidden /> Saving lives since 2008
          </p>
        </div>
      </div>
    </footer>
  );
}
