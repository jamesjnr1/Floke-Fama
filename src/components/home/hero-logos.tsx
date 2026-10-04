import Image from 'next/image';
import { clients, technologyPartners } from '@/data/seed';

/** Same visual area for every logo, so a wide wordmark and a round crest read as the same size. */
function box(w: number, h: number, area: number, maxW: number, maxH = 52) {
  const ratio = w / h;
  let height = Math.min(Math.max(Math.sqrt(area / ratio), 22), maxH);
  let width = height * ratio;
  if (width > maxW) {
    width = maxW;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * "Our Partners & Clientele" as the hero's bottom band, in two clear groups: the brands Flokefama is the
 * official distributor of (still, always fully visible), and the hospitals it serves (a slow logo row).
 */
export function HeroLogos() {
  const clientRow = (hidden: boolean) =>
    clients.map((c) => {
      const b = box(c.w, c.h, 1900, 120, 40);
      return (
        <li key={`${c.name}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="flex h-11 shrink-0 items-center px-6 md:px-8">
          <Image src={c.logo} alt={hidden ? '' : c.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain" />
        </li>
      );
    });

  return (
    <div className="relative z-10 border-t border-line bg-paper text-ink">
      <div className="mx-auto grid max-w-[1280px] gap-3 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-0 md:px-10 md:py-3.5 md:pl-20 min-[1360px]:pl-10">
        {/* The brands Flokefama distributes */}
        <div className="md:pr-10">
          <p className="label eyebrow">Official distributor of</p>
          <ul className="mt-1.5 flex items-center gap-6 md:gap-8">
            {technologyPartners.map((p) => {
              const b = p.logo ? box(p.w, p.h, 1500, 120, 34) : null;
              return (
                <li key={p.name} className="flex h-9 items-center">
                  {p.logo && b ? (
                    <Image src={p.logo} alt={p.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain" />
                  ) : (
                    <span className="whitespace-nowrap text-lg font-bold tracking-[-0.03em] text-ink">{p.name}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* The hospitals and labs it serves */}
        <div className="min-w-0 border-line md:border-l md:pl-10">
          <p className="label eyebrow">Trusted by 700+ hospitals &amp; labs</p>
          <div className="relative mt-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
            <ul className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {clientRow(false)}
              {clientRow(true)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
