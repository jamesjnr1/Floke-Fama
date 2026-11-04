import { HeaderPreload } from '@/components/layout/header-preload';
import { Navbar } from '@/components/layout/Navbar';
import { SiteFooter } from '@/components/layout/site-footer';
import { ImageGuard } from '@/components/media/image-guard';
import { SalesDock } from '@/components/sales/sales-dock';
import { introOn, introPlayScript, introScript } from '@/lib/intro';
import { SiteIntro } from '@/components/layout/site-intro';

/** Public site chrome. The client portal has its own shell (app/portal/layout.tsx). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The opening (logo in the middle, rising into the header): decided before the first paint */}
      {introOn && <script dangerouslySetInnerHTML={{ __html: introScript }} />}
      {introOn && <SiteIntro />}
      <Navbar />
      {/* The header (and its logo) is in the page now: start the opening without waiting for React */}
      {introOn && <script dangerouslySetInnerHTML={{ __html: introPlayScript('header [data-intro-target]') }} />}
      <main id="main" lang="en">{children}</main>
      <SiteFooter />
      <SalesDock />
      <HeaderPreload />
      <ImageGuard />
    </>
  );
}
