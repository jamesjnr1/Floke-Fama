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

/** One white logo tile inside a gridline cell (the logos carry their own white backgrounds and dark text). */
function Tile({ children }: { children: React.ReactNode }) {
  return (
    <li className="bg-[#0f1a1f]/80 p-2 sm:p-3">
      <div className="flex h-24 items-center justify-center rounded-md bg-white px-2 sm:h-32 sm:px-6">{children}</div>
    </li>
  );
}

/**
 * Our Partners & Clientele, across the bottom of the hero: a dark band with thin gridlines and the real logos,
 * large, in two groups: the brands Flokefama is the official distributor of, and the hospitals it serves.
 */
export function HeroLogos() {
  return (
    <div className="relative border-t border-white/10 bg-[linear-gradient(90deg,#0f1a1f,#0d2a2c_50%,#0f1a1f)]">
      <div aria-hidden className="gridlines-dark absolute inset-0" />
      <div className="relative mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
        <div className="grid gap-px border border-white/10 bg-white/10">
          <div className="bg-[#0f1a1f]/80">
            <p className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] text-brand-300">
              <span className="size-1.5 bg-brand-300" aria-hidden /> Official distributor of
            </p>
            <ul className="grid grid-cols-3 gap-px">
              {technologyPartners.map((p) => {
                const b = p.logo ? box(p.w, p.h, 16000, 260, 84) : null;
                return (
                  <Tile key={p.name}>
                    {p.logo && b ? (
                      <Image src={p.logo} alt={p.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="max-w-full object-contain" />
                    ) : (
                      <span className="text-center text-xl font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">{p.name}</span>
                    )}
                  </Tile>
                );
              })}
            </ul>
          </div>
          <div className="bg-[#0f1a1f]/80">
            <p className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] text-[#ff9a9a]">
              <span className="size-1.5 bg-signal" aria-hidden /> Trusted by 700+ hospitals &amp; labs
            </p>
            <ul className="grid grid-cols-3 gap-px sm:grid-cols-6">
              {clients.map((c) => {
                const b = box(c.w, c.h, 8000, 170, 96);
                return (
                  <Tile key={c.name}>
                    <Image src={c.logo} alt={c.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="max-h-full max-w-full object-contain" />
                  </Tile>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
