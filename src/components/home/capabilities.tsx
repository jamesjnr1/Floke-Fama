import Image from 'next/image';
import Link from 'next/link';
import { HeartPulse, Microscope, PackageCheck, Wrench } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/** Each pillar has its own accent, so the icons are never one flat colour. */
const accents = {
  green: { box: 'border-brand-300/40 text-brand-300 group-hover:bg-brand-300 group-hover:border-brand-300', tag: 'text-brand-300 border-brand-300/40', dot: 'bg-brand-300' },
  teal: { box: 'border-[#54cdd6]/40 text-[#54cdd6] group-hover:bg-[#54cdd6] group-hover:border-[#54cdd6]', tag: 'text-[#8fdde3] border-[#54cdd6]/40', dot: 'bg-[#54cdd6]' },
  red: { box: 'border-[#ff6b6b]/45 text-[#ff8a8a] group-hover:bg-signal group-hover:border-signal group-hover:!text-white', tag: 'text-[#ff9a9a] border-[#ff6b6b]/45', dot: 'bg-[#ff6b6b]' },
  amber: { box: 'border-[#f5b82e]/45 text-[#f5b82e] group-hover:bg-[#f5b82e] group-hover:border-[#f5b82e]', tag: 'text-[#f5c95a] border-[#f5b82e]/45', dot: 'bg-[#f5b82e]' },
} as const;

const pillars = [
  {
    icon: Microscope,
    title: 'In-Vitro Diagnostics',
    tag: 'IVD',
    body: 'Biochemistry and haematology analysers with matched reagents and controls that keep laboratories running without interruption. Official distributor of Mindray and Biozek Holland.',
    specs: ['Biochemistry analysers', 'Haematology analysers', 'Point-of-care testing', 'Microbiology equipment'],
    href: '/products?category=in-vitro-diagnostics',
    accent: 'green',
    image: '/images/solution-ivd.webp',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    icon: HeartPulse,
    title: 'Patient Monitoring & Critical Care',
    tag: 'Life support',
    body: 'Monitors, defibrillators, CTG and respiratory support for wards and theatres.',
    specs: ['Patient monitors', 'Defibrillators', 'ECG machines', 'CPAP & oxygen therapy'],
    href: '/products?category=critical-care',
    accent: 'teal',
    photo: '/images/products/patient-monitor-comen.webp',
    span: 'lg:col-span-2',
  },
  {
    icon: Wrench,
    title: 'Biomedical Engineering',
    tag: 'Service',
    body: 'Installation, calibration and maintenance by our engineers.',
    specs: ['Installation & commissioning', 'Calibration', 'Repairs & spare parts'],
    href: '/services',
    accent: 'red',
    span: '',
  },
  {
    icon: PackageCheck,
    title: 'Reagents & Consumables',
    tag: 'Supply',
    body: 'A continuous, reliable supply of reagents, cuvettes and disposables.',
    specs: ['Chemistry reagents', 'Medical disposables', '6 branches nationwide'],
    href: '/products?category=consumables',
    accent: 'amber',
    span: '',
  },
] as const;

/** Home: "Core Capabilities", the four pillars as a bento of gridline cells on the deep brand field. */
export function Capabilities() {
  return (
    <section aria-labelledby="capabilities-title" className="relative isolate overflow-hidden bg-[#10191e] py-16 md:py-28">
      <div aria-hidden className="gridlines-dark absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -left-40 top-1/2 -z-10 size-[520px] rounded-full bg-brand-500/12 blur-[120px]" />
      <div aria-hidden className="absolute bottom-0 right-0 -z-10 size-[420px] rounded-full bg-[#0d9ba8]/10 blur-[100px]" />

      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 id="capabilities-title" className="display text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] text-white">
              Four pillars of <br className="hidden sm:block" />
              <span className="text-brand-300">medical infrastructure.</span>
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-white/75">
            From diagnostics to delivery: an integrated service model, so every piece of equipment performs reliably. Official distributor of Mindray, Biozek Holland and MR Global.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const a = accents[p.accent];
            const Ico = p.icon;
            return (
              <Reveal key={p.title} delay={i * 0.05} className={cn('h-full', p.span)}>
                <Link
                  href={p.href}
                  className="group relative flex h-full min-h-[300px] flex-col justify-between gap-8 overflow-hidden bg-[#121d23] p-6 transition-colors duration-500 hover:bg-[#16262d] lg:p-8"
                >
                  {'image' in p && (
                    <div aria-hidden className="absolute inset-0 opacity-90 transition-opacity duration-700 group-hover:opacity-100">
                      <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover object-[80%_20%]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121d23] via-[#121d23]/70 to-transparent" />
                    </div>
                  )}
                  <div className="relative flex items-start justify-between gap-4">
                    <span className={cn('grid size-12 place-items-center border transition-colors duration-300 group-hover:text-[#10191e]', a.box)}>
                      <Ico className="size-6" strokeWidth={1.6} aria-hidden />
                    </span>
                    {'photo' in p ? (
                      <span className="relative hidden size-24 overflow-hidden rounded-md bg-sand sm:block">
                        <Image src={p.photo} alt="" fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />
                      </span>
                    ) : (
                      <span className={cn('border-l pl-2 font-mono text-[0.875rem] uppercase tracking-wider', a.tag)}>{p.tag}</span>
                    )}
                  </div>
                  <div className="relative flex flex-col gap-4">
                    <h3 className="text-xl font-bold leading-tight tracking-[-0.02em] text-white lg:text-2xl">{p.title}</h3>
                    <p className="leading-relaxed text-white/75">{p.body}</p>
                    <ul className="flex flex-col gap-2 border-t border-white/10 pt-4">
                      {p.specs.map((s) => (
                        <li key={s} className="flex items-center gap-2.5 font-mono text-[0.9375rem] text-white/70 transition-colors group-hover:text-white">
                          <span className={cn('size-1.5 shrink-0', a.dot)} aria-hidden />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <span className="text-sm font-semibold text-brand-300 underline-offset-4 group-hover:underline">Learn more</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
