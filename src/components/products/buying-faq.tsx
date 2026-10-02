import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';

/** Buying from Flokefama: the questions a hospital or lab asks before it requests a quote. Facts from the current site. */
const faqs: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: 'How do I get a price?',
    a: 'Prices depend on the model, configuration, quantity and the service package you choose, so every order is quoted. Add products to your quote list, or press “Request a quote” on any product. A specialist replies within one business day.',
    link: { href: '/quote', label: 'Request a quote' },
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
    a: 'Often, yes. Our team sources beyond the catalogue: tell us what you need in the quote form.',
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
        <p className="label">Buying from Flokefama</p>
        <h2 id="buying-faq" className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">Questions before you order</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">Still unsure? Our sales team will help you choose.</p>
        <a href={`${contact.whatsapp}?text=${encodeURIComponent('Hello Flokefama, I have a question before ordering.')}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-600">
          <Icon name="fi-brands-whatsapp" /> Ask on WhatsApp
        </a>
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
                {f.link.label} <Icon name="fi-rr-arrow-small-right" />
              </Link>
            )}
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
