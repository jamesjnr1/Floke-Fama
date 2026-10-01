import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/contact-form';
import { VisitUs } from '@/components/contact/visit-us';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { contact, maps } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call +233 53 339 2863, email or WhatsApp Flokefama, or visit our head office in Santa Maria, Accra, and our branches across Ghana.',
  alternates: { canonical: '/contact' },
};

/** Three ways in, each with the channels that fit (all from the current Contact page). */
const routes = [
  {
    icon: 'fi-rr-shopping-cart',
    title: 'Sales & quotes',
    body: 'Pricing, tenders, demonstrations and new equipment.',
    actions: [
      { label: 'Request a quote', href: '/quote', primary: true },
      { label: contact.sales, href: `mailto:${contact.sales}` },
    ],
  },
  {
    icon: 'fi-rr-settings',
    title: 'Service & support',
    body: 'Faults, repairs, calibration and spare parts for installed systems.',
    actions: [
      { label: 'Call the service line', href: contact.phoneHref, primary: true },
      { label: contact.support, href: `mailto:${contact.support}` },
    ],
  },
  {
    icon: 'fi-rr-envelope',
    title: 'General enquiries',
    body: 'Partnerships, press, careers and everything else.',
    actions: [
      { label: 'WhatsApp us', href: contact.whatsapp, primary: true, external: true },
      { label: contact.info, href: `mailto:${contact.info}` },
    ],
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-midnight pb-20 pt-36 text-white md:pb-28 md:pt-44">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-56 size-[760px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.26),transparent_62%)]" />
          <div className="grid-fade absolute inset-0 opacity-50" />
        </div>
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="label flex items-center gap-3 !text-brand-300"><span className="status-dot" aria-hidden /> Contact</p>
              <h1 className="display mt-5 text-[clamp(2.75rem,1.4rem+4.4vw,5.5rem)] text-white">How can we help?</h1>
            </div>
            <a href={contact.phoneHref} className="group flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-600 text-xl transition group-hover:bg-brand-700"><Icon name="fi-rr-headset" /></span>
              <span>
                <span className="block font-mono text-[11px] uppercase tracking-widest text-white/45">Call centre</span>
                <span className="block text-2xl font-semibold tracking-[-0.02em]">{contact.phone}</span>
              </span>
            </a>
          </Reveal>

          {/* Three ways in */}
          <ul className="mt-14 grid gap-4 md:grid-cols-3">
            {routes.map((r, i) => (
              <li key={r.title}>
                <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-4xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-brand-400/40">
                  <Icon name={r.icon} className="text-2xl text-brand-300" />
                  <h2 className="mt-8 text-2xl font-bold tracking-[-0.02em] text-white">{r.title}</h2>
                  <p className="mt-2 text-sm font-light leading-relaxed text-white/60">{r.body}</p>
                  <div className="mt-auto space-y-2 pt-8">
                    {r.actions.map((a) =>
                      a.primary ? (
                        a.href.startsWith('/') ? (
                          <Link key={a.label} href={a.href} className="flex h-11 items-center justify-between rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
                            {a.label} <Icon name="fi-rr-arrow-small-right" />
                          </Link>
                        ) : (
                          <a key={a.label} href={a.href} {...('external' in a && a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex h-11 items-center justify-between rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700">
                            {a.label} <Icon name="fi-rr-arrow-small-right" />
                          </a>
                        )
                      ) : (
                        <a key={a.label} href={a.href} className="flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white">
                          <Icon name="fi-rr-envelope" className="text-brand-300" /> {a.label}
                        </a>
                      ),
                    )}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          {/* Message + head office */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Reveal id="get-in-touch" className="scroll-mt-28 rounded-4xl border border-white/10 bg-white/[0.04] p-6 md:p-9">
              <h2 className="text-2xl font-bold tracking-[-0.02em] text-white">Send us a message</h2>
              <p className="mb-6 mt-1 text-sm text-white/50">We’ll route it to the right team and get back to you.</p>
              <ContactForm />
            </Reveal>
            <Reveal delay={0.08}>
              <figure className="relative isolate flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-4xl">
                <Image src="/images/head-office.webp" alt="The Floke Company head office building in Santa Maria, Accra" fill sizes="(min-width: 1024px) 40vw, 100vw" className="-z-10 object-cover object-[50%_30%]" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight from-20% via-midnight/70 via-45% to-transparent" />
                <figcaption className="p-7">
                  <p className="label flex items-center gap-2 !text-brand-300"><span className="status-dot" aria-hidden /> Head office</p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.02em] text-white">Santa Maria, Accra</p>
                  <p className="mt-1 text-sm text-white/60">{contact.address}</p>
                  <a href={maps.directions} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-ink transition hover:bg-brand-50">
                    <Icon name="fi-rr-navigation" className="text-brand-600" /> Get directions
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>
      <VisitUs photo={false} />
    </>
  );
}
