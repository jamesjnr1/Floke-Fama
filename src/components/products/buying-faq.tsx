import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';

/** Buying from Flokefama: the questions a hospital or lab asks before it requests a quote. Facts from the current site. */
const faqs: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: 'How do I get a price?',
    a: 'Prices depend on the model, configuration, quantity and the service package you choose, so every order is quoted. Add products to your cart, or press “Order now” on any product. A specialist replies within one business day.',
    link: { href: '/quote', label: 'Order now' },
  },
  {
    q: 'Can I see the equipment working before I buy?',
    a: 'Yes. Book a demonstration from any product page and our applications team will arrange it at your facility.',
  },
  {
    q: 'Which brands do you supply?',
    a: 'Flokefama is the official distributor of Mindray, Biozek Holland and MR Global, alongside other trusted manufacturers in the catalogue.',
  },
  {
    q: 'Do you install the equipment and train our staff?',
    a: 'Yes. We handle installation, calibration and training, then support you with maintenance, repairs and calibration for the life of the equipment.',
    link: { href: '/services', label: 'Our services' },
  },
  {
    q: 'How do we get service after installation?',
    a: 'Through the Flokefama client portal: request a service visit, follow the engineer’s progress and download calibration certificates. You can also call or message us on WhatsApp.',
    link: { href: '/login', label: 'Client portal' },
  },
  {
    q: 'Can you supply something that isn’t in the catalogue?',
    a: 'Often, yes. Our team sources beyond the catalogue: tell us what you need at checkout.',
  },
  {
    q: 'Where can we find you?',
    a: `Head office in Santa Maria, Accra, with branches at Korle-Bu, Okaishie, Kumasi, Aflao and Techiman. Call ${contact.phone} or email ${contact.sales}.`,
    link: { href: '/contact', label: 'Contact and directions' },
  },
];

export function BuyingFaq() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section aria-labelledby="buying-faq" className="grid gap-8 border-t border-line pb-20 pt-12 md:pb-28 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <p className="label eyebrow">Buying from Flokefama</p>
          <h2 id="buying-faq" className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Questions before you order</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">Still unsure? Our sales team will help you choose the right equipment for your facility.</p>
          {/* Every way to reach sales, in one place */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-midnight text-white">
            <div className="p-5">
              <p className="text-sm font-semibold">Talk to sales</p>
              <p className="mt-1 text-xs text-white/75">Replies within one business day</p>
            </div>
            <ul className="divide-y divide-white/10 border-t border-white/10 text-sm">
              <li>
                <a href={`${contact.whatsapp}?text=${encodeURIComponent('Hello Flokefama, I have a question before ordering.')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/5">
                  <Icon name="fi-brands-whatsapp" className="text-lg text-[#25D366]" /> <span className="flex-1">WhatsApp</span>
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/5">
                  <Icon name="fi-rr-phone-call" className="text-lg text-brand-300" /> <span className="flex-1">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.sales}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/5">
                  <Icon name="fi-rr-envelope" className="text-lg text-brand-300" /> <span className="min-w-0 flex-1 truncate">{contact.sales}</span>
                </a>
              </li>
            </ul>
            <Link href="/quote" className="flex items-center justify-center gap-2 bg-cta px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-cta-700">
              Order now
            </Link>
          </div>
        </div>
      </div>
      <div className="divide-y divide-line rounded-3xl border border-line bg-paper lg:col-span-8">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4 md:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <Icon name="fi-rr-plus" className="shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-3">{f.a}</p>
            {f.link && (
              <Link href={f.link.href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
                {f.link.label}
              </Link>
            )}
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
