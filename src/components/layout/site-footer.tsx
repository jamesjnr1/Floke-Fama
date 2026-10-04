import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { branches, categories, contact, maps } from '@/data/seed';

/** Footer columns follow the current flokefama.com footer: Company, Products & Solutions, Media Centre, Contact. */
const company = [
  { href: '/about#who-we-are', label: 'Who we are' },
  { href: '/about#mission', label: 'Our mission & vision' },
  { href: '/services#why-choose-us', label: 'Why choose us' },
  { href: '/awards', label: 'Awards & recognition' },
  { href: '/esg', label: 'ESG' },
  { href: '/contact', label: 'Contact us' },
];

const media = [
  { href: '/events', label: 'Events & activities' },
  { href: '/#testimonials', label: 'Customer stories' },
  { href: '/events#news', label: 'News' },
];

export function SiteFooter() {
  return (
    <footer className="bg-[linear-gradient(135deg,#0a5636_0%,#00492c_55%,#003a23_100%)] text-white/75">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 md:grid-cols-2 md:gap-12 md:px-10 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo tone="dark" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Revolutionizing healthcare practices in Ghana by introducing cutting-edge technologies and solutions that set new standards in medical care and patient safety.
          </p>
        </div>
        <FooterCol title="Company">
          {company.map((l) => (
            <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
          ))}
        </FooterCol>
        <FooterCol title="Products & solutions" className="hidden md:block">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/products?category=${c.slug}`} className="hover:text-white">{c.title}</Link>
            </li>
          ))}
          <li><Link href="/products" className="font-medium text-brand-300 hover:text-white">Go to Shop </Link></li>
        </FooterCol>
        <FooterCol title="Media centre">
          {media.map((l) => (
            <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
          ))}
          <li className="pt-3"><Link href="/portal" className="hover:text-white">Client portal</Link></li>
          <li><Link href="/engineer" className="hover:text-white">Engineer sign in</Link></li>
        </FooterCol>
        <FooterCol title="Contact" className="col-span-2 md:col-span-1">
          <li><a href={contact.phoneHref} className="hover:text-white">{contact.phone}</a></li>
          <li><a href={`mailto:${contact.info}`} className="hover:text-white">{contact.info}</a></li>
          <li>
            <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-white">
              <Icon name="fi-rr-marker" className="mt-0.5 text-brand-400" /> <span>Head office, Santa Maria, Accra<span className="block text-xs text-brand-300">Get directions</span></span>
            </a>
          </li>
          <li className="text-xs leading-relaxed text-white/60">Branches: {branches.filter((b) => b.name !== 'Santa Maria').map((b) => b.name).join(' · ')}</li>
        </FooterCol>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 border-t border-white/10 px-5 py-6 text-xs md:px-10">
        <p>© {new Date().getFullYear()} Flokefama Company Limited. All rights reserved.</p>
        <p className="text-white/60">Saving lives since 2008</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="label !text-white/60">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm md:mt-5 md:space-y-3">{children}</ul>
    </div>
  );
}
