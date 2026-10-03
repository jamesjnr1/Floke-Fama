import Image from 'next/image';
import { clients, technologyPartners } from '@/data/seed';

/** Same visual area for every logo, so a wide wordmark and a round crest read as the same size. */
function box(w: number, h: number, area = 2600, maxW = 150) {
  const ratio = w / h;
  let height = Math.min(Math.max(Math.sqrt(area / ratio), 22), 52);
  let width = height * ratio;
  if (width > maxW) {
    width = maxW;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

const logos = [
  ...technologyPartners.map((p) => ({ name: p.name, logo: p.logo, w: p.w, h: p.h })),
  ...clients.map((c) => ({ name: c.name, logo: c.logo, w: c.w, h: c.h })),
];

/**
 * "Our Partners & Clientele", as on the current site, as the hero's bottom band: the official
 * distributorships and the hospitals Flokefama serves, in one slow, continuous logo row.
 */
export function HeroLogos() {
  const row = (hidden: boolean) =>
    logos.map((l) => {
      const b = l.logo ? box(l.w, l.h) : null;
      return (
        <li key={`${l.name}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="flex h-16 shrink-0 items-center px-7 md:px-10">
          {l.logo && b ? (
            <Image src={l.logo} alt={hidden ? '' : l.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain" />
          ) : (
            <span className="whitespace-nowrap text-xl font-bold tracking-[-0.03em] text-ink">{l.name}</span>
          )}
        </li>
      );
    });

  return (
    <div className="relative z-10 border-t border-line bg-paper text-ink">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:gap-8 md:px-10 md:py-5">
        <div className="shrink-0 md:w-56">
          <p className="label !text-signal-700">Our Partners &amp; Clientele</p>
          <p className="mt-1 text-sm text-ink-3">Official distributor · 700+ facilities served</p>
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {row(false)}
            {row(true)}
          </ul>
        </div>
      </div>
    </div>
  );
}
