import type { Metadata } from 'next';
import { Services } from '@/components/home/services';
import { SitePageHero } from '@/components/layout/site-page-hero';
import { CatalogueGrid } from '@/components/products/catalogue-grid';
import { DepartmentSolutions } from '@/components/products/department-solutions';
import { Reveal } from '@/components/motion/reveal';
import { PhotoGallery } from '@/components/media/photo-gallery';
import { getSite } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Products & Services',
  description: 'Medical equipment sales, installation, maintenance, calibration, repairs and training, from the official distributor of Mindray.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const { engineering } = await getSite();
  return (
    <>
      <SitePageHero page="services" />
      {/* The product catalogue first, then the end-to-end solutions */}
      <CatalogueGrid />
      <DepartmentSolutions />
      <Services />
      {/* The engineering department at work: appears once photos are added in the Studio (Site content → Services) */}
      {engineering.photos.length > 0 && (
        <section id="engineering" aria-labelledby="engineering-title" className="scroll-mt-28 border-t border-line bg-canvas section-y">
          <div className="mx-auto max-w-[1280px] px-5 md:px-10">
            <Reveal className="mb-8 max-w-3xl md:mb-12">
              <h2 id="engineering-title" className="display text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">{engineering.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-3">{engineering.lead}</p>
            </Reveal>
            <PhotoGallery photos={engineering.photos} label={engineering.title} />
          </div>
        </section>
      )}

    </>
  );
}
