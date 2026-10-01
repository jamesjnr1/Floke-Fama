import { ContactForm } from '@/components/contact/contact-form';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

const channels = [
  { icon: 'fi-rr-headset', label: 'Call centre', value: contact.phone, href: contact.phoneHref },
  { icon: 'fi-brands-whatsapp', label: 'WhatsApp', value: 'Chat with us', href: contact.whatsapp, external: true },
  { icon: 'fi-rr-envelope', label: 'General', value: contact.info, href: `mailto:${contact.info}` },
  { icon: 'fi-rr-shopping-cart', label: 'Sales', value: contact.sales, href: `mailto:${contact.sales}` },
  { icon: 'fi-rr-settings', label: 'Support', value: contact.support, href: `mailto:${contact.support}` },
];

/** "Get in touch with us": every channel from the current Contact page, plus a message form. Lives at the top of the footer. */
export function GetInTouch({ heading = true }: { heading?: boolean }) {
  return (
    <section id="get-in-touch" className={cn('relative isolate scroll-mt-28 overflow-hidden border-b border-white/10 bg-midnight pb-16 text-white md:pb-20', heading ? 'pt-20 md:pt-24' : 'pt-0')}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 size-[640px] rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.22),transparent_65%)]" />
        <div className="grid-fade absolute inset-0 opacity-50" />
      </div>
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:px-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          {heading && (
            <Reveal>
              <p className="label !text-brand-300">Get in touch</p>
              <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.4vw,3.25rem)] text-white">Get in touch with us.</h2>
              <p className="mt-4 max-w-md font-light leading-relaxed text-white/60">
                We are committed to providing top-quality medical solutions and outstanding customer service.
              </p>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <ul className={cn('grid gap-2 sm:grid-cols-2 lg:grid-cols-1', heading && 'mt-8')}>
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 transition hover:border-brand-400/40 hover:bg-white/[0.06]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><Icon name={c.icon} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[11px] uppercase tracking-widest text-white/40">{c.label}</span>
                      <span className="block truncate text-sm text-white">{c.value}</span>
                    </span>
                    <Icon name="fi-rr-arrow-small-right" className="text-white/30 transition group-hover:translate-x-1 group-hover:text-brand-300" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="lg:col-span-7">
          <div className="rounded-4xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl md:p-8">
            <p className="text-xl font-bold tracking-[-0.02em] text-white">Send us a message</p>
            <p className="mb-6 mt-1 text-sm text-white/50">We’re here to provide total healthcare solutions. Reach out to us anytime.</p>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
