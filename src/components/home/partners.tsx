import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { clients, technologyPartners } from '@/data/seed';

/** "Our Partners & Clientele", as on the original site: full-colour logos on clean cards. */
export function Partners() {
  return (
    <section id="partners" className="scroll-mt-28 border-b border-line bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col items-center text-center">
          <p className="label">Our partners &amp; clientele</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">Trusted by Ghana’s leading hospitals and global manufacturers.</h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_2.1fr] lg:gap-6">
          <div>
            <p className="label mb-4">Technology partners</p>
            <Reveal>
            <ul className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {technologyPartners.map((p) => (
                  <li key={p.name} className="flex h-24 items-center justify-center rounded-2xl border border-line bg-paper px-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-25px_rgb(15_23_42/0.35)] lg:justify-between">
                    {p.logo ? (
                      <Image src={p.logo} alt={p.name} width={160} height={56} className="h-10 w-auto max-w-[130px] object-contain" />
                    ) : (
                      <span className="text-lg font-bold tracking-tight text-ink">{p.name}</span>
                    )}
                    <span className="label hidden !text-[10px] lg:block">{p.role}</span>
                  </li>
              ))}
            </ul>
            </Reveal>
          </div>
          <div>
            <p className="label mb-4">Clientele</p>
            <Reveal delay={0.08}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {clients.map((c) => (
                  <li key={c.name} className="group flex h-full min-h-[132px] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-paper p-5 text-center transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-25px_rgb(15_23_42/0.35)]">
                    <Image src={c.logo} alt={c.name} width={160} height={72} className="h-14 w-auto max-w-[150px] object-contain" />
                    <span className="text-xs text-ink-3">{c.name}</span>
                  </li>
              ))}
            </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
