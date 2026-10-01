import Link from 'next/link';
import { GetInTouch } from '@/components/contact/get-in-touch';
import { HideOn } from '@/components/layout/hide-on';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { branches, categories, maps } from '@/data/seed';

/** Footer: "Get in touch" first, then the columns of the current flokefama.com footer. */
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
  { href: '/about#testimonials', label: 'Customer stories' },
  { href: '/events#news', label: 'News' },
];

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-white/60">
      {/* The Contact page has its own, fuller version */}
      <HideOn paths={['/contact']}>
        <GetInTouch />
      </HideOn>
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 md:grid-cols-2 md:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="dark" />
          <p className="mt-5 max-w-xs text-sm font-light leading-relaxed">
            Revolutionising healthcare practices in Ghana with cutting-edge technologies and solutions that set new standards in medical care and patient safety.
          </p>
        </div>
        <FooterCol title="Company">
          {company.map((l) => (
            <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
          ))}
        </FooterCol>
        <FooterCol title="Products & solutions">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/products?category=${c.slug}`} className="hover:text-white">{c.title}</Link>
            </li>
          ))}
          <li><Link href="/products" className="font-medium text-brand-300 hover:text-white">Go to shop →</Link></li>
        </FooterCol>
        <FooterCol title="Media centre">
          {media.map((l) => (
            <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
          ))}
          <li className="pt-3"><Link href="/portal" className="hover:text-white">Client portal</Link></li>
          <li><Link href="/engineer" className="hover:text-white">Engineer sign in</Link></li>
        </FooterCol>
        <FooterCol title="Visit us">
          <li>
            <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-white">
              <Icon name="fi-rr-marker" className="mt-0.5 text-brand-400" /> <span>Head office, Santa Maria, Accra<span className="block text-xs text-brand-300">Get directions →</span></span>
            </a>
          </li>
          <li className="text-xs leading-relaxed text-white/40">Branches: {branches.filter((b) => b.name !== 'Santa Maria').map((b) => b.name).join(' · ')}</li>
        </FooterCol>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 border-t border-white/10 px-5 py-6 text-xs md:px-10">
        <p>© {new Date().getFullYear()} Flokefama Company Limited. All rights reserved.</p>
        <p className="text-white/40">Saving lives since 2008</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="label !text-white/40">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm font-light">{children}</ul>
    </div>
  );
}
