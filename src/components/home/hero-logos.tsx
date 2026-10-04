import Image from 'next/image';
import { clients, technologyPartners } from '@/data/seed';

/** Same visual area for every logo, so a wide wordmark and a round crest read as the same size. */
function box(w: number, h: number, area: number, maxW: number, maxH: number) {
  const ratio = w / h;
  let height = Math.min(Math.sqrt(area / ratio), maxH);
  let width = height * ratio;
  if (width > maxW) {
    width = maxW;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

const logos = [
  ...technologyPartners.map((p) => ({ name: p.name, logo: p.logo, w: p.w, h: p.h })),
  ...clients.map((c) => ({ name: c.name, logo: c.logo as string | null, w: c.w, h: c.h })),
];

/**
 * Our Partners & Clientele, across the bottom of the hero, as on FLOKE_BOLT: one slow, continuous row between
 * two hairlines, but with the real logos (large, on white tiles) instead of names. Hover pauses the row.
 */
export function HeroLogos() {
  const row = (hidden: boolean) =>
    logos.map((l) => {
      const b = l.logo ? box(l.w, l.h, 11000, 200, 88) : null;
      return (
        <li key={`${l.name}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="shrink-0 px-3 md:px-4">
          <div className="flex h-28 w-56 items-center justify-center rounded-md bg-white px-5 ring-2 ring-transparent transition duration-300 hover:-translate-y-1 hover:ring-brand-300 md:h-32 md:w-64">
            {l.logo && b ? (
              <Image src={l.logo} alt={hidden ? '' : l.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="max-w-full object-contain" />
            ) : (
              <span className="text-3xl font-extrabold tracking-[-0.03em] text-ink">{l.name}</span>
            )}
          </div>
        </li>
      );
    });

  return (
    <div className="relative bg-[linear-gradient(90deg,#0f1a1f,#0d2a2c_50%,#0f1a1f)] py-8 md:py-10">
      <h2 className="sr-only">Our Partners &amp; Clientele</h2>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="relative overflow-hidden border-y border-white/10 py-7 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
          <ul className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {row(false)}
            {row(true)}
          </ul>
        </div>
      </div>
    </div>
  );
}
