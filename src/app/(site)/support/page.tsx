import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
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
  { title: 'Installation', text: 'Setup and commissioning of every system we supply.' },
  { title: 'Preventive maintenance', text: 'Scheduled servicing and calibration to prevent breakdowns.' },
  { title: 'Troubleshooting', text: 'Fast diagnosis by phone, WhatsApp or on site.' },
  { title: 'Repairs', text: 'Repairs that get your equipment back in use quickly.' },
  { title: 'Customer assistance', text: 'Training and help for your team whenever you need it.' },
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
      {/* Header: a support agent with a headset (Pexels photo 7709184) */}
      <PageHero
        title={<>Technical <em>support</em></>}
        lead="Installation, maintenance, troubleshooting and repairs by Flokefama’s own engineers."
        image="/images/headers/support-agent.webp"
        position="50% 40%"
      />

      {/* What we do: a simple numbered list */}
      <section className="bg-canvas section-y">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)]">What we do</h2>
            <p className="no-justify mt-4 text-lg leading-relaxed text-ink-3">Our engineers look after your equipment from the day it arrives.</p>
          </div>
          <ol className="border-t border-line lg:col-span-8">
            {services.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-line py-6 md:grid-cols-[3.5rem_15rem_1fr] md:gap-x-6 md:py-7">
                <span className="text-lg font-semibold tabular-nums text-brand-600">0{i + 1}</span>
                <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                <p className="no-justify col-start-2 mt-1.5 text-lg leading-relaxed text-ink-3 md:col-start-3 md:mt-0">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Report a fault or request help */}
      <section id="request" className="scroll-mt-20 border-t border-line bg-paper py-14 md:py-20">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Report a fault or request help</h2>
            <p className="mt-2 text-ink-3">Tell us what you need and our support team will call you back.</p>
            <div className="mt-6 rounded-lg border border-line bg-canvas p-6 md:p-8">
              <SupportForm />
            </div>
          </div>
          <aside className="lg:col-span-4 lg:pt-[4.25rem]">
            <div className="overflow-hidden rounded-lg border border-line bg-paper">
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
