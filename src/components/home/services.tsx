import { Reveal } from '@/components/motion/reveal';
import { IconTile } from '@/components/ui/icon';

const services = [
  { icon: 'fi-rr-box-open', title: 'Equipment supply', body: 'Genuine, warrantied systems from globally recognised manufacturers.' },
  { icon: 'fi-rr-settings', title: 'Installation & commissioning', body: 'Set up, tested and documented on site by certified engineers.' },
  { icon: 'fi-rr-chart-line-up', title: 'Calibration', body: 'Traceable precision that protects every patient result.' },
  { icon: 'fi-rr-shield-check', title: 'Preventive maintenance', body: 'Scheduled plans that keep critical equipment in spec.' },
  { icon: 'fi-rr-tool-box', title: 'Repairs & genuine parts', body: 'Rapid response from six branches to minimise downtime.' },
  { icon: 'fi-rr-graduation-cap', title: 'Training', body: 'Hands-on training that builds confident clinical teams.' },
] as const;

/** Asymmetric layout: sticky statement on the left, service list scrolling on the right. */
export function Services() {
  return (
    <section id="services" className="scroll-mt-20 border-y border-line bg-paper py-28 md:py-40">
      <div className="mx-auto grid max-w-[1280px] gap-16 px-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="label">Lifecycle services</p>
          <h2 className="display mt-5 text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)]">
            We don’t just deliver. <span className="text-surgical-600">We stay.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink-3">
            Every system we supply is backed by biomedical engineers across six branches, from commissioning day to its final service.
          </p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}>
              <li className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-8">
                <IconTile name={s.icon} />
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm font-light text-ink-3">{s.body}</p>
                </div>
                <span className="label tabular-nums transition-colors group-hover:text-surgical-600">{String(i + 1).padStart(2, '0')}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
