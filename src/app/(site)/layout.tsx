import { Navbar } from '@/components/layout/Navbar';
import { SiteFooter } from '@/components/layout/site-footer';
import { SalesDock } from '@/components/sales/sales-dock';

/** Public site chrome. The client portal has its own shell (app/portal/layout.tsx). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <SiteFooter />
      <SalesDock />
    </>
  );
}
