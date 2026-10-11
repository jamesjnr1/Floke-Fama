import type { Metadata } from 'next';
import Link from 'next/link';
import { SupportForm } from '@/components/support/support-form';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Technical Support',
  description: 'Installation, preventive maintenance, troubleshooting and repairs from Flokefama’s engineers. Report a fault or request technical assistance.',
  alternates: { canonical: '/support' },
};

/** The support the CEO's review lists (point 6), one line each. */
const services = [
  { icon: 'fi-rr-settings', title: 'Installation', text: 'Setup and commissioning of every system we supply.' },
  { icon: 'fi-rr-shield-check', title: 'Preventive maintenance', text: 'Scheduled servicing and calibration to prevent breakdowns.' },
  { icon: 'fi-rr-search-alt', title: 'Troubleshooting', text: 'Fast diagnosis by phone, WhatsApp or on site.' },
  { icon: 'fi-rr-tool-box', title: 'Repairs', text: 'Repairs that get your equipment back in use quickly.' },
  { icon: 'fi-rr-headset', title: 'Customer assistance', text: 'Training and help for your team whenever you need it.' },
];

export default async function SupportPage() {
  const { contact } = await getSite();
  const channels = [
    { icon: 'fi-rr-phone-call', label: 'Call', value: contact.phone, href: contact.phoneHref },
    { icon: 'fi-brands-whatsapp', label: 'WhatsApp', value: contact.phone, href: contact.whatsapp, external: true },
    { icon: 'fi-rr-envelope', label: 'Email', value: contact.support, href: `mailto:${contact.support}` },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-[linear-gradient(135deg,#10191e_0%,#16232a_55%,#0b3b40_100%)] pb-16 pt-32 text-white md:pb-20 md:pt-40">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-300">Technical Support</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,1.4rem+3vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white">We keep your equipment running.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">Installation, maintenance, troubleshooting and repairs by Flokefama’s own engineers.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#request" className="inline-flex h-12 items-center gap-2 bg-cta px-6 font-semibold text-white transition hover:bg-cta-700">Report a fault</a>
            <a href={contact.phoneHref} className="inline-flex h-12 items-center gap-2 border border-white/30 px-6 font-semibold text-white transition hover:border-white/60">
              <Icon name="fi-rr-phone-call" /> {contact.phone}
            </a>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">What we do</h2>
          <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((s) => (
              <li key={s.title} className="flex gap-4 border-t border-line py-5 lg:block lg:pt-6">
                <Icon name={s.icon} className="mt-0.5 text-xl text-brand-600 lg:mt-0" />
                <div className="lg:mt-4">
                  <h3 className="font-semibold text-ink">{s.title}</h3>
                  <p className="no-justify mt-1 text-ink-3">{s.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Report a fault or request help */}
      <section id="request" className="scroll-mt-20 border-t border-line bg-canvas py-14 md:py-20">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Report a fault or request help</h2>
            <p className="mt-2 text-ink-3">Tell us what you need and our support team will call you back.</p>
            <div className="mt-6 border border-line bg-paper p-6 md:p-8">
              <SupportForm />
            </div>
          </div>
          <aside className="lg:col-span-4 lg:pt-[4.25rem]">
            <div className="border border-line bg-paper">
              <p className="border-b border-line px-6 py-4 font-semibold text-ink">Contact the support team</p>
              <ul className="divide-y divide-line">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-canvas">
                      <Icon name={c.icon} className="text-lg text-brand-600" />
                      <span className="min-w-0">
                        <span className="block text-sm text-ink-3">{c.label}</span>
                        <span className="block truncate font-medium text-ink group-hover:text-brand-700">{c.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-ink-3">
              Already a client? <Link href="/portal" className="font-semibold text-brand-700 hover:underline">Log the fault in your client portal</Link> and follow it until it’s fixed.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
