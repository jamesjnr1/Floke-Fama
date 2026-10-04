import { Cog, Gauge, GraduationCap, Settings, ShoppingCart, Wrench } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { ToneIcon, type Tone } from '@/components/ui/tone-icon';
import { cn } from '@/lib/utils';

/** The six services, worded as on the current Services page. */
const services = [
  { icon: ShoppingCart, tone: 'green', title: 'Medical Equipment Sales', body: 'We supply a wide range of high-quality medical equipment to meet the diverse needs of hospitals, clinics, and laboratories.' },
  { icon: Settings, tone: 'teal', title: 'Equipment Installation & Commissioning', body: 'Ensuring proper installation and setup is crucial for the efficiency and longevity of medical equipment.' },
  { icon: Wrench, tone: 'blue', title: 'Technical Support & Maintenance', body: 'To ensure continuous, uninterrupted operation of all deployed medical systems and instruments.' },
  { icon: Gauge, tone: 'red', title: 'Calibration Services', body: 'Accuracy is critical in medical diagnostics and treatment. Precise calibration for accuracy and reliability.' },
  { icon: Cog, tone: 'amber', title: 'Equipment Repairs & Spare Parts', body: 'Medical equipment is a major investment. We minimise breakdown impact with efficient repairs and genuine spare parts supply.' },
  { icon: GraduationCap, tone: 'teal', title: 'Training & Capacity Building', body: 'We empower healthcare professionals with the knowledge and skills they need to operate medical equipment effectively.' },
] as const satisfies readonly { icon: unknown; tone: Tone; title: string; body: string }[];

/** Hover fill per tone: the icon box turns solid, white icon. */
const solid: Record<Tone, string> = {
  green: 'group-hover:bg-brand-500 group-hover:border-brand-500',
  teal: 'group-hover:bg-[#0d9ba8] group-hover:border-[#0d9ba8]',
  blue: 'group-hover:bg-[#0074bb] group-hover:border-[#0074bb]',
  red: 'group-hover:bg-signal group-hover:border-signal',
  amber: 'group-hover:bg-[#e8ab00] group-hover:border-[#e8ab00]',
};

/** Our services: a 3 × 2 grid of cells divided by thin gridlines. A cell turns dark on hover. */
export function Services() {
  return (
    <section id="services" className="gridlines-light relative scroll-mt-20 bg-canvas py-14 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.18em] text-blue-700">
              <span className="h-px w-8 bg-blue-700" aria-hidden /> Our services
            </p>
            <h2 className="display mt-4 text-[clamp(2rem,1.3rem+2.6vw,3.5rem)]">
              End-to-end healthcare <br className="hidden sm:block" />
              <span className="text-brand-600">solutions, not just supply.</span>
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-ink-3">
            We go beyond supplying medical equipment: from procurement and installation to training and maintenance, so our clients get the most out of their investment.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.title} className="group bg-canvas transition-colors duration-500 hover:bg-[#10191e]">
              <Reveal delay={(i % 3) * 0.05} className="flex h-full flex-col gap-5 p-7 lg:p-10">
                <div className="flex items-start justify-between">
                  <ToneIcon icon={s.icon} tone={s.tone} className={cn('group-hover:text-white', solid[s.tone])} />
                  <span className="font-mono text-sm text-ink-3 transition-colors group-hover:text-brand-300">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-white lg:text-[1.375rem]">{s.title}</h3>
                <p className="leading-relaxed text-ink-3 transition-colors group-hover:text-white/75">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
