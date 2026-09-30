import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export function PortalTeaser() {
  return (
    <section className="bg-canvas py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="relative isolate grid overflow-hidden rounded-5xl bg-midnight p-8 text-white md:p-14 lg:grid-cols-2 lg:gap-16">
          <div className="grid-fade absolute inset-0 -z-10" />
          <div className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.35),transparent_65%)]" />
          <div className="self-center">
            <p className="label !text-neon-300">Flokefama Care · Client portal</p>
            <h2 className="display mt-5 text-[clamp(2.25rem,1.3rem+3vw,4rem)] text-white">Every service call. Tracked in real time.</h2>
            <p className="mt-6 max-w-md font-light text-white/60">
              Log faults, follow your engineer from our hub to your facility, and keep manuals, schematics and calibration certificates for every installed system in one place.
            </p>
            <Button asChild variant="glow" size="lg" className="mt-10">
              <Link href="/portal">Explore the portal <Icon name="fi-rr-arrow-small-right" /></Link>
            </Button>
          </div>

          {/* Static product shot of the portal UI */}
          <div className="mt-12 space-y-3 lg:mt-0" aria-hidden>
            {[
              { id: 'TK-1042', title: 'BC-5150: background count high', status: 'Engineer en route', tone: 'green' as const },
              { id: 'TK-1039', title: 'BS-240: quarterly preventive maintenance', status: 'Scheduled', tone: 'blue' as const },
              { id: 'TK-1031', title: 'Autoclave 50 L: door seal replaced', status: 'Resolved', tone: 'neutral' as const },
            ].map((t, i) => (
              <div key={t.id} className="glass flex items-center justify-between gap-4 rounded-3xl p-5" style={{ transform: `translateX(${i * 16}px)` }}>
                <div>
                  <p className="text-[11px] font-medium tracking-wider text-white/40">{t.id}</p>
                  <p className="mt-1 text-sm font-medium text-white">{t.title}</p>
                </div>
                <Badge tone={t.tone === 'neutral' ? 'dark' : t.tone}>{t.status}</Badge>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
