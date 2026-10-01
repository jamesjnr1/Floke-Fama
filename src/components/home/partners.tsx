import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { clients, technologyPartners } from '@/data/seed';

/**
 * Optical sizing: every logo gets the same visual area, so a wide wordmark and a round
 * crest read as the same size. Height is clamped for very wide or very tall marks.
 */
function logoBox(w: number, h: number, area: number, maxW: number) {
  const ratio = w / h;
  let height = Math.sqrt(area / ratio);
  height = Math.min(Math.max(height, 28), 76);
  let width = height * ratio;
  if (width > maxW) {
    width = maxW;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

/** "Our Partners & Clientele", as on the original site. */
export function Partners({ heading = true }: { heading?: boolean }) {
  return (
    <section id="partners" className="scroll-mt-28 border-b border-line bg-canvas py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        {heading && (
          <Reveal className="mb-14 flex flex-col items-center text-center">
            <p className="label">Our partners &amp; clientele</p>
            <h2 className="display mt-4 max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">Trusted by Ghana’s leading hospitals and global manufacturers.</h2>
          </Reveal>
        )}

        {/* Official distributor */}
        <Reveal>
          <div className="grid overflow-hidden rounded-4xl border border-line bg-paper lg:grid-cols-[0.8fr_2fr]">
            <div className="flex flex-col justify-center gap-3 border-b border-line p-7 lg:border-b-0 lg:border-r lg:p-9">
              <p className="label flex items-center gap-2"><Icon name="fi-rr-badge-check" className="text-brand-600" /> Official distributor</p>
              <p className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">Genuine equipment, original reagents and manufacturer-backed support.</p>
            </div>
            <ul className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {technologyPartners.map((p) => {
                const box = p.logo ? logoBox(p.w, p.h, 7000, 190) : null;
                return (
                  <li key={p.name} className="group flex h-32 items-center justify-center px-6 transition-colors hover:bg-canvas sm:h-40">
                    {p.logo && box ? (
                      <Image src={p.logo} alt={p.name} width={box.width} height={box.height} style={{ width: box.width, height: box.height }} className="object-contain transition-transform duration-500 ease-out-expo group-hover:scale-105" />
                    ) : (
                      <span className="text-[1.75rem] font-bold tracking-[-0.03em] text-ink transition-transform duration-500 ease-out-expo group-hover:scale-105">{p.name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>

        {/* Clientele */}
        <Reveal delay={0.08}>
          <div className="mt-6 flex items-center gap-4">
            <p className="label shrink-0">Trusted by</p>
            <span className="h-px flex-1 bg-line" aria-hidden />
            <p className="shrink-0 text-xs text-ink-3">700+ hospitals &amp; laboratories, including</p>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {clients.map((c) => {
              const box = logoBox(c.w, c.h, 4200, 150);
              return (
                <li
                  key={c.name}
                  className="group flex flex-col items-center justify-between gap-4 rounded-3xl border border-line bg-paper px-4 pb-5 pt-7 text-center transition duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(11_21_16/0.4)]"
                >
                  <span className="flex h-20 items-center justify-center">
                    <Image src={c.logo} alt="" width={box.width} height={box.height} style={{ width: box.width, height: box.height }} className="object-contain" />
                  </span>
                  <span className="text-[13px] leading-tight text-ink-2">{c.name}</span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
