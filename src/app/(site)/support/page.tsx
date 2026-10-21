import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { SupportForm } from '@/components/support/support-form';
import { Icon } from '@/components/ui/icon';
import { getSite } from '@/lib/site';
import { telHref } from '@/lib/utils';

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
  const { contact, branches } = await getSite();
  const channels = [
    { icon: 'fi-rr-phone-call', label: 'Call (24/7)', value: contact.phone, href: contact.phoneHref },
    { icon: 'fi-brands-whatsapp', label: 'WhatsApp', value: contact.phone, href: contact.whatsapp, external: true },
    { icon: 'fi-rr-envelope', label: 'Email', value: contact.support, href: `mailto:${contact.support}` },
  ];

  return (
    <>
      {/* Header: two support agents at a laptop (sharpened to 2000px), under the darker veil so the text reads */}
      <PageHero
        title={<>Technical <em>support</em></>}
        lead="Installation, maintenance, troubleshooting and repairs by Flokefama’s own engineers."
        image="/images/headers/support-team.webp"
        position="50% 30%"
        veil="strong"
      />

      {/* 24/7 call centre (from Flokefama's client service presentation, Oct 2026) */}
      <section aria-labelledby="call-centre" className="border-b border-line bg-paper py-12 md:py-16">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Client service · 24/7 call centre</p>
            <h2 id="call-centre" className="display mt-2 text-[clamp(1.875rem,1.2rem+2.2vw,2.75rem)]">We answer around the clock</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div className="bg-canvas p-6">
                <h3 className="text-xl font-semibold text-ink">24/7 dedicated call centre</h3>
                <p className="no-justify mt-1.5 text-lg leading-relaxed text-ink-3">Our helpline runs continuously, day and night, for immediate client support and rapid service response.</p>
              </div>
              <div className="bg-canvas p-6">
                <h3 className="text-xl font-semibold text-ink">Seamless operational assistance</h3>
                <p className="no-justify mt-1.5 text-lg leading-relaxed text-ink-3">Full business coverage from experienced call centre agents committed to excellence.</p>
              </div>
            </div>
          </div>
          <div className="bg-midnight p-8 text-white lg:col-span-5 md:p-10">
            <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.08em] text-brand-300">Client helpline · open 24/7</p>
            <a href={contact.phoneHref} className="mt-3 block text-[clamp(2rem,1.4rem+2vw,2.75rem)] font-bold tracking-[-0.02em] text-white hover:text-brand-300">
              {contact.phone}
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={contact.phoneHref} className="inline-flex h-12 items-center gap-2 bg-brand-600 px-5 font-semibold text-white transition-colors hover:bg-brand-700">
                <Icon name="fi-rr-phone-call" /> Call now
              </a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 border border-white/30 px-5 font-semibold text-white transition-colors hover:bg-white/10">
                <Icon name="fi-brands-whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What we do: installation highlighted, the other four services as cards */}
      <section className="pattern-cross pattern-tr bg-canvas section-y">
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
      <section id="request" className="pattern-dots scroll-mt-20 border-t border-line bg-paper py-14 md:py-20">
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
            <div className="mt-5 overflow-hidden rounded-lg border border-line bg-paper">
              <p className="border-b border-line px-6 py-4 font-semibold text-ink">Call your nearest branch</p>
              <ul className="divide-y divide-line">
                {branches.filter((b) => b.phone).map((b) => (
                  <li key={b.name}>
                    <a href={telHref(b.phone!)} className="group flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-canvas">
                      <span className="min-w-0 text-ink-2">
                        {b.name}
                        {b.detail.toLowerCase().includes('head office') && <span className="block text-sm text-ink-3">Head office</span>}
                      </span>
                      <span className="shrink-0 whitespace-nowrap font-medium tabular-nums text-ink group-hover:text-brand-700">{b.phone}</span>
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
