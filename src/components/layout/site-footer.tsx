import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { branches, categories, contact } from '@/data/seed';

// TODO: replace with the official profile URLs from Flokefama
const social = [
  { label: 'LinkedIn', icon: 'fi-brands-linkedin', href: '#' },
  { label: 'Facebook', icon: 'fi-brands-facebook', href: '#' },
  { label: 'Instagram', icon: 'fi-brands-instagram', href: '#' },
  { label: 'WhatsApp', icon: 'fi-brands-whatsapp', href: contact.whatsapp },
];

export function SiteFooter() {
  return (
    <footer className="bg-midnight text-white/60">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 md:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="dark" />
          <p className="mt-5 max-w-xs text-sm font-light leading-relaxed">Total healthcare solutions for Ghana and West Africa. Saving lives since 2008.</p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className="glass grid size-10 place-items-center rounded-full text-white transition hover:bg-brand-600">
                  <Icon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <FooterCol title="Products">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/products?category=${c.slug}`} className="hover:text-white">{c.title}</Link>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Company">
          <li><Link href="/impact" className="hover:text-white">Institutional impact</Link></li>
          <li><Link href="/partners" className="hover:text-white">Technology partners</Link></li>
          <li><Link href="/media" className="hover:text-white">Media hub</Link></li>
          <li><Link href="/solutions" className="hover:text-white">Solutions &amp; services</Link></li>
          <li><Link href="/portal" className="hover:text-white">Client portal</Link></li>
          <li><Link href="/quote?intent=demo" className="hover:text-white">Book a demonstration</Link></li>
        </FooterCol>
        <FooterCol title="Contact">
          <li><a href={contact.phoneHref} className="hover:text-white">{contact.phone}</a></li>
          <li><a href={`mailto:${contact.sales}`} className="hover:text-white">{contact.sales}</a></li>
          <li><a href={`mailto:${contact.support}`} className="hover:text-white">{contact.support}</a></li>
          <li className="pt-2 text-xs leading-relaxed text-white/40">{branches.map((b) => b.name).join(' · ')}</li>
        </FooterCol>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-4 border-t border-white/10 px-5 py-6 text-xs md:px-10">
        <p>© {new Date().getFullYear()} Flokefama Company Limited</p>
        <p className="text-white/40">Privacy policy &amp; terms: pending from Flokefama</p>
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
