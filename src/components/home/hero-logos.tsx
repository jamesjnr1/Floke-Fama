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
 * Our Clients & Partners, under the hero: a white band with the real logos moving in one slow row from edge to
 * edge (no boxes, no fade). Hover pauses the row.
 */
export function HeroLogos() {
  const row = (hidden: boolean) =>
    logos.map((l) => {
      const b = l.logo ? box(l.w, l.h, 12500, 240, 96) : null;
      return (
        <li key={`${l.name}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="flex h-28 shrink-0 items-center px-8 md:h-32 md:px-12">
          {l.logo && b ? (
            <Image src={l.logo} alt={hidden ? '' : l.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain transition-transform duration-300 hover:scale-105" />
          ) : (
            <span className="whitespace-nowrap text-4xl font-extrabold tracking-[-0.03em] text-ink">{l.name}</span>
          )}
        </li>
      );
    });

  return (
    <div className="border-y border-line bg-white py-10 text-ink md:py-14">
      <h2 className="mx-auto max-w-[1280px] px-5 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-bold tracking-[-0.03em] md:px-10">
        Our Clients &amp; Partners
      </h2>
      <div className="mt-6 overflow-hidden md:mt-8">
        <ul className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {row(false)}
          {row(true)}
        </ul>
      </div>
    </div>
  );
}
