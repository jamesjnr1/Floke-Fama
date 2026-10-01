import type { Metadata } from 'next';
import Link from 'next/link';
import { VisitUs } from '@/components/contact/visit-us';
import { PageHero } from '@/components/layout/page-hero';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call +233 53 339 2863, email or WhatsApp Flokefama, or visit our head office in Santa Maria, Accra, and our branches across Ghana.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title={<>Get in touch <span className="text-gradient">with us</span></>}
        lead="We’re here to provide total healthcare solutions. Reach out to us anytime."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="glow" size="lg">
            <Link href="#get-in-touch">Send a message <Icon name="fi-rr-arrow-small-right" /></Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <a href={contact.phoneHref}><Icon name="fi-rr-phone-call" /> {contact.phone}</a>
          </Button>
          <Button asChild variant="glass" size="lg">
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="fi-brands-whatsapp" /> WhatsApp</a>
          </Button>
        </div>
      </PageHero>
      <VisitUs />
    </>
  );
}
