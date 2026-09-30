import type { Metadata } from 'next';
import { Inventory } from '@/components/portal/inventory';
import { Tickets } from '@/components/portal/tickets';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assets, demoFacility, tickets } from '@/data/portal-demo';

export const metadata: Metadata = {
  title: 'Flokefama Care: Client Portal',
  description: 'Track service tickets, engineer dispatch and calibration records for every installed system.',
  robots: { index: false },
};

export default function PortalPage() {
  const active = tickets.filter((t) => t.status !== 'resolved').length;
  return (
    <div className="bg-canvas">
      <section className="relative isolate overflow-hidden bg-midnight pb-28 pt-36 text-white">
        <div className="grid-fade absolute inset-0 -z-10" />
        <div className="absolute -right-40 -top-40 -z-10 size-[600px] rounded-full bg-[radial-gradient(circle,rgb(31_157_87/0.3),transparent_65%)]" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="label !text-surgical-300">Flokefama Care</p>
            <Badge tone="amber">Demo data</Badge>
          </div>
          <h1 className="display mt-5 text-[clamp(2.5rem,1.4rem+4vw,5rem)] text-white">{demoFacility.name}</h1>
          <p className="mt-3 text-white/55">{demoFacility.site}</p>
          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ['Open tickets', String(active), 'fi-rr-time-fast'],
              ['Installed systems', String(assets.length), 'fi-rr-box-open'],
              ['Calibrations due', String(assets.filter((a) => a.health === 'due').length), 'fi-rr-chart-line-up'],
            ].map(([k, v, icon]) => (
              <div key={k} className="glass rounded-3xl p-5">
                <Icon name={icon} className="text-surgical-300" />
                <dd className="mt-4 text-3xl font-semibold tracking-tight">{v}</dd>
                <dt className="text-xs text-white/50">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-12 md:px-10">
        <Tabs defaultValue="tickets" className="gap-8">
          <TabsList aria-label="Portal sections" className="self-start">
            <TabsTrigger value="tickets"><Icon name="fi-rr-headset" /> Service tickets</TabsTrigger>
            <TabsTrigger value="inventory"><Icon name="fi-rr-box-open" /> Installed inventory</TabsTrigger>
          </TabsList>
          <TabsContent value="tickets"><Tickets /></TabsContent>
          <TabsContent value="inventory"><Inventory /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
