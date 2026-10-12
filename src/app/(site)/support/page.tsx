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

/** The support the CEO's review lists (point 6); installation is shown first, highlighted. */
const services = [
  { icon: 'fi-rr-shield-check', title: 'Preventive maintenance', text: 'Scheduled servicing and calibration that keep equipment accurate and in peak condition, minimising downtime.' },
  { icon: 'fi-rr-search-alt', title: 'Troubleshooting', text: 'Fast diagnosis by phone, WhatsApp or on site, so faults are understood and resolved quickly.' },
  { icon: 'fi-rr-tool-box', title: 'Repairs & spare parts', text: 'Efficient repairs and genuine spare parts that get equipment back in service.' },
  { icon: 'fi-rr-headset', title: 'Customer assistance', text: 'Ongoing help and training for clinical and laboratory teams, whenever they need it.' },
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

      {/* What we do: installation highlighted, the other four services as cards */}
      <section className="bg-canvas section-y">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)] lg:col-span-7">What we do</h2>
            <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">Our engineers look after your equipment from the day it arrives, for as long as you use it.</p>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <li className="rounded-2xl bg-midnight p-8 text-white md:col-span-2 md:p-10">
              <span className="grid size-12 place-items-center rounded-lg bg-brand-600 text-xl text-white"><Icon name="fi-rr-settings" /></span>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.01em] text-white">Installation &amp; calibration</h3>
              <p className="no-justify mt-3 max-w-xl text-lg leading-relaxed text-white/80">Every system is installed, commissioned and calibrated by our engineers, and your team is trained to use it before we hand over.</p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {['Installation & commissioning', 'Calibration for accuracy', 'Training at handover'].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 rounded-md bg-white/[0.07] px-4 py-3 text-[0.9375rem] text-white/90">
                    <Icon name="fi-rr-check" className="text-brand-300" /> {x}
                  </li>
                ))}
              </ul>
            </li>
            {services.map((s) => (
              <li key={s.title} className="rounded-2xl border border-line bg-paper p-8">
                <span className="grid size-12 place-items-center rounded-lg bg-brand-50 text-xl text-brand-700"><Icon name={s.icon} /></span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                <p className="no-justify mt-2.5 text-lg leading-relaxed text-ink-3">{s.text}</p>
              </li>
            ))}
          </ul>
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
