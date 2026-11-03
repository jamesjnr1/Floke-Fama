import Image from 'next/image';
import { getSite } from '@/lib/site';

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

/**
 * Our Clients & Partners, under the hero: a white band with the real logos, still (no boxes): one row on computers, an
 * even grid on phones and tablets. Hospitals show only their logo: no name is written on the page (their name is the
 * alt text).
 */
export async function HeroLogos() {
  const { technologyPartners, clients } = await getSite();
  const logos = [
    ...technologyPartners.map((l) => ({ name: l.name, logo: l.logo, w: l.w, h: l.h })),
    ...clients.filter((c) => c.logo).map((c) => ({ name: c.name, logo: c.logo, w: c.w, h: c.h })),
  ];
  const items = logos.map((l) => {
    // Two sizes: computers (one row) and phones and tablets (an even grid, three across on a phone)
    const big = l.logo ? box(l.w, l.h, 7000, 170, 72) : null;
    const small = l.logo ? box(l.w, l.h, 3400, 104, 52) : null;
    return (
      <li key={l.name} className="flex h-[76px] basis-1/3 items-center justify-center px-2 sm:basis-1/5 md:h-24 lg:basis-auto lg:shrink lg:px-4 xl:px-6">
        {l.logo && big && small ? (
          <Image
            src={l.logo}
            alt={l.name}
            width={big.width}
            height={big.height}
            style={{ '--w': `${small.width}px`, '--h': `${small.height}px`, '--lw': `${big.width}px`, '--lh': `${big.height}px` } as React.CSSProperties}
            className="h-auto max-h-[var(--h)] w-[var(--w)] max-w-full object-contain transition-transform duration-300 hover:scale-105 lg:max-h-[var(--lh)] lg:w-[var(--lw)]"
          />
        ) : (
          <span className="whitespace-nowrap text-2xl font-extrabold tracking-[-0.03em] text-ink lg:text-4xl">{l.name}</span>
        )}
      </li>
    );
  });

  return (
    <div className="shrink-0 border-t border-line bg-white py-5 text-ink md:py-6">
      <h2 className="mx-auto max-w-[1280px] px-5 text-[clamp(1.375rem,1.1rem+0.8vw,1.875rem)] font-bold tracking-[-0.03em] md:px-10">
        Our Clients &amp; Partners
      </h2>
      {/* Still: every logo once. Computers: one even row. Phones and tablets: an even grid (three or five across), every
          logo in the same size of cell, the last row centred */}
      <ul className="mx-auto mt-3 flex max-w-[1440px] flex-wrap items-center justify-center gap-y-2 px-3 py-1 md:px-10 lg:mt-2 lg:flex-nowrap lg:gap-y-0 lg:py-2">
        {items}
      </ul>
    </div>
  );
}
