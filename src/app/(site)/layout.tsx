import { HeaderPreload } from '@/components/layout/header-preload';
import { Navbar } from '@/components/layout/Navbar';
import { SiteFooter } from '@/components/layout/site-footer';
import { ImageGuard } from '@/components/media/image-guard';
import { SalesDock } from '@/components/sales/sales-dock';
import localFont from 'next/font/local';
import { introOn, introScript, SiteIntro } from '@/components/layout/site-intro';

/** Poppins Medium (Latin, SIL Open Font License) for the motto in the opening, kept in the site like the other fonts. */
const poppins = localFont({ src: '../fonts/poppins-500.woff2', weight: '500', display: 'swap' });

/** Public site chrome. The client portal has its own shell (app/portal/layout.tsx). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The opening (logo in the middle, rising into the header): decided before the first paint */}
      {introOn && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      {introOn && <SiteIntro mottoClassName={poppins.className} />}
      <Navbar />
      <main id="main" lang="en">{children}</main>
      <SiteFooter />
      <SalesDock />
      <HeaderPreload />
      <ImageGuard />
    </>
  );
}
