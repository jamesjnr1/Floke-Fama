import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { LogoWordmark } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/** The showcase: products from the shop, cut out of their white backgrounds so they sit on the glass cards. */
const featured = [
  { slug: 'autoclave-machine-35l', title: 'Autoclave Machine 35L', tag: 'Sterilisation', type: 'Autoclave machines', body: 'Steam steriliser for surgical instruments and laboratory glassware.' },
  { slug: 'biological-microscope', title: 'Biological Microscope', tag: 'Laboratory', type: 'Microscopes', body: 'Clear, precise optics for clinical diagnostics and laboratory work.' },
  { slug: 'cpap-machine', title: 'CPAP Machine', tag: 'Respiratory', type: 'CPAP machines', body: 'Continuous positive airway pressure for patients who need breathing support.' },
  { slug: 'dp-10-ultrasound', title: 'DP-10 Ultrasound', tag: 'Imaging', type: 'Mindray ultrasound', body: 'Portable ultrasound for imaging at the bedside and in the clinic.' },
  { slug: 'omron-m7', title: 'Omron M7 BP Monitor', tag: 'Monitoring', type: 'Blood pressure monitors', body: 'Automatic upper-arm blood pressure monitor for wards and clinics.' },
  { slug: 'oxygen-cylinder-40l', title: 'Oxygen Cylinder 40L', tag: 'Respiratory', type: 'Oxygen therapy', body: 'Medical oxygen storage for respiratory and critical care.' },
  { slug: 'emergency-trolley', title: 'Emergency Trolley', tag: 'Emergency', type: 'Crash carts', body: 'Mobile trolley with drawers for emergency medicines and supplies.' },
];

/**
 * The 'modern' hero: on a deep green gradient with a soft glow and a faint pulsing ECG line, the wordmark, the
 * claim, the short text and the two actions, centred; then "Featured medical solutions" as glass cards moving
 * slowly across, the products shown as cut-outs. The Clients & Partners band follows unchanged.
 */
export function ModernHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#083825_0%,#042217_60%,#021810_100%)] pt-[72px] text-white">
      {/* Soft green light behind the headline */}
      <div aria-hidden className="absolute left-1/2 top-[22%] -z-10 h-[500px] w-[900px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(16_185_129/0.2),transparent)]" />
      {/* A faint ECG line pulsing across the middle */}
      <svg aria-hidden className="absolute inset-x-0 top-[34%] -z-10 h-40 w-full animate-[ecg-pulse_4s_ease-in-out_infinite] text-emerald-400 opacity-20 motion-reduce:animate-none" viewBox="0 0 1200 150" preserveAspectRatio="none" fill="none">
        <path d="M0 75H350L365 40L380 110L400 20L420 130L435 60L450 75H1200" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <Reveal className="mx-auto flex max-w-[1100px] flex-col items-center px-5 pb-12 pt-12 text-center md:pt-16">
        <h1 className="flex flex-col items-center">
          <span className="flex items-center text-[clamp(3rem,1.6rem+4.4vw,5.5rem)]">
            <LogoWordmark className="h-[0.75em] text-white" />
            <span className="sr-only">Flokefama,</span>
          </span>
          <span className="mt-4 text-[clamp(1.75rem,1.1rem+1.9vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-emerald-50">
            Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
          </span>
        </h1>
        <p className="no-justify mt-6 max-w-3xl text-[clamp(1rem,0.9rem+0.4vw,1.25rem)] leading-relaxed text-emerald-100/80">
          Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: <span className="font-medium text-white">supplied, installed and supported</span> for hospitals and
          laboratories across Ghana and West Africa.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
            <Link href="/products">Explore Solutions</Link>
          </Button>
          <Button asChild size="lg" variant="red" arrow="right">
            <Link href="/support">Contact Us</Link>
          </Button>
        </div>
      </Reveal>

      <div className="pb-12">
        <h2 className="mx-auto mb-5 max-w-[1280px] px-5 text-sm font-bold uppercase tracking-[0.12em] text-emerald-300 md:px-10">Featured medical solutions</h2>
        {/* The cards move slowly from right to left; the ends fade out */}
        <div className="overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="flex w-max animate-marquee [animation-duration:50s] motion-reduce:animate-none">
            {[false, true].flatMap((hidden) =>
              featured.map((p) => (
                <li key={`${p.slug}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="w-[280px] shrink-0 pr-5 sm:w-[314px] sm:pr-6">
                  <Link
                    href={`/products/${p.slug}`}
                    tabIndex={hidden ? -1 : undefined}
                    className="group flex h-full flex-col rounded-lg border border-white/12 bg-white/[0.05] p-4 shadow-[0_8px_32px_rgb(0_0_0/0.2)] backdrop-blur-md transition-[background-color,border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.09] sm:p-5"
                  >
                    <span className="relative block h-44 overflow-hidden rounded-md bg-[linear-gradient(180deg,rgb(255_255_255/0.1),transparent)] sm:h-48">
                      <span className="absolute left-2 top-2 z-10 rounded-sm border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-emerald-300">{p.tag}</span>
                      <Image
                        src={`/images/hero-cutouts/${p.slug}.webp`}
                        alt={hidden ? '' : p.title}
                        fill
                        sizes="290px"
                        className="object-contain p-5 pt-8 drop-shadow-[0_10px_15px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-4 block text-base font-bold text-white transition-colors group-hover:text-emerald-300">{p.title}</span>
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-white/60">{p.body}</span>
                    <span className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-xs font-semibold">
                      <span className="text-emerald-400">{p.type}</span>
                      <span className="flex items-center gap-1 text-white group-hover:text-emerald-300">
                        Explore <Icon name="fi-rr-arrow-small-right" />
                      </span>
                    </span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
