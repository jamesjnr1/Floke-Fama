import type { Metadata } from 'next';
import { GetInTouch } from '@/components/contact/get-in-touch';
import { VisitUs } from '@/components/contact/visit-us';
import { PageHero } from '@/components/layout/page-hero';

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
      />
      <GetInTouch heading={false} />
      <VisitUs />
    </>
  );
}
