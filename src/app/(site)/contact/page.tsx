import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/contact-form';
import { VisitUs } from '@/components/contact/visit-us';
import { PageHero } from '@/components/layout/page-hero';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call +233 53 339 2863, email or WhatsApp Flokefama, or visit our head office in Santa Maria, Accra, and our branches across Ghana.',
  alternates: { canonical: '/contact' },
};

/** Every channel on the current Contact page. */
const details = [
  { icon: 'fi-rr-phone-call', label: 'Call Center', value: contact.phone, href: contact.phoneHref },
  { icon: 'fi-brands-whatsapp', label: 'WhatsApp', value: contact.phone, href: contact.whatsapp, external: true },
  { icon: 'fi-rr-shopping-cart', label: 'Sales & quotes', value: contact.sales, href: `mailto:${contact.sales}` },
  { icon: 'fi-rr-settings', label: 'Service & support', value: contact.support, href: `mailto:${contact.support}` },
  { icon: 'fi-rr-envelope', label: 'General enquiries', value: contact.info, href: `mailto:${contact.info}` },
];

export default function ContactPage() {
  return (
    <>
      <PageHero label="Contact" title={<>Get in touch <span className="text-gradient">with us</span></>} lead="We’re here to provide total healthcare solutions. Reach out to us anytime." />

      <section className="bg-canvas py-12 md:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Talk to us</h2>
            <p className="mt-1 text-ink-3">We are committed to providing top-quality medical solutions and outstanding customer service.</p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {details.map((d) => (
                <li key={d.label}>
                  <a href={d.href} {...(d.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex items-center gap-4 py-4">
                    <Icon name={d.icon} className="text-lg text-brand-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink-3">{d.label}</span>
                      <span className="block truncate font-medium text-ink group-hover:text-brand-700">{d.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {/* What to expect when you get in touch */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-line bg-paper p-5">
                <Icon name="fi-rr-time-fast" className="text-xl text-brand-600" />
                <p className="mt-3 font-semibold text-ink">One business day</p>
                <p className="mt-1 text-sm text-ink-3">Our reply time for quotes and messages.</p>
              </div>
              <div className="rounded-3xl border border-line bg-paper p-5">
                <Icon name="fi-rr-headset" className="text-xl text-brand-600" />
                <p className="mt-3 font-semibold text-ink">24-hour support</p>
                <p className="mt-1 text-sm text-ink-3">For installed equipment, through our technical support centre.</p>
              </div>
            </div>
          </div>

          <div id="message" className="scroll-mt-28 rounded-4xl border border-line bg-paper p-6 md:p-10">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">Send a message</h2>
            <p className="mb-6 mt-1 text-ink-3">We’ll pass it to the right team.</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <VisitUs />
    </>
  );
}
