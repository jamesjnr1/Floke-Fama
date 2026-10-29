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
 * Our Clients & Partners, under the hero: a white band with the real logos in one still row (no boxes). Hospitals
 * show only their logo: no name is written on the page (their alt text is their code, e.g. "Client hospital FF-H02").
 */
export async function HeroLogos() {
  const { technologyPartners, clients } = await getSite();
  const logos = [
    ...technologyPartners.map((l) => ({ name: l.name, logo: l.logo, w: l.w, h: l.h })),
    ...clients.filter((c) => c.logo).map((c) => ({ name: c.code ? `Client hospital ${c.code}` : 'Client hospital', logo: c.logo, w: c.w, h: c.h })),
  ];
  const row = (hidden: boolean) =>
    logos.map((l) => {
      const b = l.logo ? box(l.w, l.h, 7000, 170, 72) : null;
      return (
        <li key={`${l.name}${hidden ? '-2' : ''}`} aria-hidden={hidden || undefined} className="flex h-24 shrink-0 items-center px-5 xl:px-7">
          {l.logo && b ? (
            <Image src={l.logo} alt={hidden ? '' : l.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain transition-transform duration-300 hover:scale-105" />
          ) : (
            <span className="whitespace-nowrap text-4xl font-extrabold tracking-[-0.03em] text-ink">{l.name}</span>
          )}
        </li>
      );
    });

  return (
    <div className="shrink-0 border-t border-line bg-white py-5 text-ink md:py-6">
      <h2 className="mx-auto max-w-[1280px] px-5 text-[clamp(1.375rem,1.1rem+0.8vw,1.875rem)] font-bold tracking-[-0.03em] md:px-10">
        Our Clients &amp; Partners
      </h2>
      {/* Still: every logo once, in one even row that wraps on smaller screens */}
      <ul className="mx-auto mt-2 flex max-w-[1440px] flex-wrap items-center justify-center px-5 py-2 md:px-10">
        {row(false)}
      </ul>
    </div>
  );
}
