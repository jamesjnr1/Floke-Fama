import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { CountUp } from '@/components/motion/count-up';
import { Icon } from '@/components/ui/icon';
import { metrics } from '@/data/seed';
import { getSite } from '@/lib/site';

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

/** "Our Partners & Clientele", as on the original site. On the home page the logos sit in the hero, so only the figures show. */
export async function Partners({ heading = true, logos = true }: { heading?: boolean; logos?: boolean }) {
  const { clients, technologyPartners } = await getSite();
  return (
    <section id="partners" className="scroll-mt-28 border-b border-line bg-canvas pb-12 pt-16 md:pb-20 md:pt-28">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        {heading && (
          <Reveal className="mb-8 flex flex-col items-center text-center md:mb-14">
            <h2 className="display max-w-3xl text-[clamp(1.9rem,1.2rem+2.4vw,3.25rem)]">Our Partners &amp; Clientele</h2>
          </Reveal>
        )}

        {logos && (
          <>
        {/* Official distributor */}
        <Reveal>
          <div className="grid overflow-hidden rounded-4xl border border-line bg-paper lg:grid-cols-[0.8fr_2fr]">
            <div className="flex flex-col justify-center gap-3 border-b border-line p-5 lg:border-b-0 lg:border-r lg:p-9">
              <p className="label flex items-center gap-2"><Icon name="fi-rr-badge-check" className="text-brand-600" /> Official distributor</p>
              <p className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">We are the official distributor of Mindray.</p>
            </div>
            <ul className="grid">
              {technologyPartners.map((p) => {
                const box = p.logo ? logoBox(p.w, p.h, 7000, 190) : null;
                return (
                  <li key={p.name} className="group flex h-20 items-center justify-center px-2 transition-colors hover:bg-canvas sm:h-40 sm:px-6">
                    {p.logo && box ? (
                      <Image src={p.logo} alt={p.name} width={box.width} height={box.height} style={{ width: box.width, height: box.height }} className="max-h-[38px] max-w-full object-contain transition-transform duration-500 ease-out-expo group-hover:scale-105 sm:max-h-none" />
                    ) : (
                      <span className="text-base font-bold tracking-[-0.03em] text-ink transition-transform sm:text-[1.75rem] duration-500 ease-out-expo group-hover:scale-105">{p.name}</span>
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
            <p className="min-w-0 text-right text-xs text-ink-3">700+ hospitals &amp; laboratories, including</p>
          </div>
          <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {/* Hospitals by code, not name or logo (the CEO, Oct 2026) */}
            {clients.map((c) => (
              <li key={c.code ?? c.name} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-paper px-2 py-5 text-center sm:rounded-3xl">
                <span className="font-mono text-lg font-bold tracking-[0.04em] text-brand-800">{c.code}</span>
                {c.kind && <span className="text-[0.9375rem] leading-tight text-ink-3">{c.kind}</span>}
              </li>
            ))}
          </ul>
        </Reveal>

          </>
        )}

        {/* The results: one balanced band (figures from the current homepage) */}
        <Reveal delay={0.1}>
          <div className={`relative isolate overflow-hidden bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white${logos ? ' mt-10' : ''}`}>
            <div className="grid divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
              {metrics.slice(0, 2).map((m, i) => (
                <div key={m.label} className="flex flex-col gap-5 p-7 md:p-10">
                  <p className="text-[clamp(2.75rem,2rem+2.4vw,4rem)] font-bold leading-none tracking-[-0.04em]">
                    <CountUp value={m.value} suffix={m.suffix} />
                  </p>
                  <p className="max-w-[16rem] text-[1.125rem] leading-snug text-white/80">{i === 0 ? 'Hospitals and medical laboratories served, and counting' : 'Successful system integrations'}</p>
                </div>
              ))}
              <div className="flex flex-col gap-5 p-7 md:p-10">
                <p className="flex min-h-[clamp(2.75rem,2rem+2.4vw,4rem)] items-end text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">Ghana Club 100</p>
                <p className="text-[1.125rem] leading-snug text-white/80">
                  Trusted badges &amp; associations: CEO’s Summit, partnerships and more.
                  <Link href="/awards" className="mt-3 flex items-center gap-1 font-medium text-white transition hover:text-white/80">View our awards</Link>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
