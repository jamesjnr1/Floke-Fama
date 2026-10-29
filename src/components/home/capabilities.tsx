import Image from 'next/image';
import Link from 'next/link';
import { Check, ImageIcon } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Each pillar has its own accent (number, ticks and link), so the six read as a set but stay distinct. */
export const accents = {
  green: { num: 'bg-brand-600', tick: 'text-brand-600', bar: 'bg-brand-600' },
  teal: { num: 'bg-[#087d88]', tick: 'text-[#087d88]', bar: 'bg-[#087d88]' },
  blue: { num: 'bg-[#0074bb]', tick: 'text-[#0074bb]', bar: 'bg-[#0074bb]' },
  slate: { num: 'bg-[#3d4f5a]', tick: 'text-[#3d4f5a]', bar: 'bg-[#3d4f5a]' },
  red: { num: 'bg-signal', tick: 'text-signal-700', bar: 'bg-signal' },
  amber: { num: 'bg-[#a87a00]', tick: 'text-[#a87a00]', bar: 'bg-[#e8ab00]' },
} as const;

/** The pillars' accents in order (the Studio sets the pillars; each takes the next accent). */
const order = ['green', 'teal', 'blue', 'slate', 'red', 'amber'] as const;

/**
 * Home: "Six pillars of medical infrastructure" (the CEO's list), edited in the Studio (Site content → Home → Our solutions). Six equal cards, three to a row, on a coloured band (the deep navy gradient by
 * default; `background` sets another): a photo, the pillar's number, what it covers in one line and three points;
 * the whole card opens that part of the site.
 */
export async function Capabilities({ background = 'bg-[linear-gradient(160deg,#10191e_0%,#16232a_55%,#0b3b40_100%)]' }: { background?: string }) {
  const { solutions } = await getSite();
  return (
    <section aria-labelledby="capabilities-title" className={cn('relative isolate overflow-hidden section-y', background)}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="inline-block w-fit bg-white/10 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-300">{solutions.kicker}</p>
            <h2 id="capabilities-title" className="display mt-4 text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] text-white">
              {solutions.title} <br className="hidden sm:block" />
              <span className="text-brand-300">{solutions.highlight}</span>
            </h2>
          </div>
          <p className="no-justify max-w-md text-lg leading-relaxed text-white/80">{solutions.lead}</p>
        </Reveal>

        <ol className="swipe-row mt-10 gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {solutions.items.map((p, i) => {
            const a = accents[order[i % order.length]];
            const product = p.fit === 'contain';
            return (
              <li key={p.title}>
                <Reveal delay={i * 0.06} className="h-full">
                  <Link
                    href={p.href}
                    className="group flex h-full flex-col overflow-hidden bg-paper shadow-[0_30px_60px_-40px_rgb(0_0_0/0.7)] transition duration-500 ease-out-expo hover:-translate-y-1.5"
                  >
                    <div className={cn('relative aspect-[16/11] overflow-hidden', !p.image ? 'bg-mist' : product ? 'bg-white' : 'bg-midnight')}>
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.alt ?? p.title}
                          fill
                          sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 84vw"
                          className={cn('transition-transform duration-700 ease-out-expo group-hover:scale-105', product ? 'object-contain p-3' : 'object-cover')}
                        />
                      ) : (
                        // No photo yet (set one in the Studio): a quiet placeholder
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="flex flex-col items-center gap-2 text-ink-3">
                            <ImageIcon className="size-10 opacity-50" strokeWidth={1.5} aria-hidden />
                            <span className="text-sm">Photo coming soon</span>
                          </span>
                        </span>
                      )}
                      <span className={cn('absolute left-4 top-4 grid size-11 place-items-center rounded-xl text-base font-bold text-white', a.num)}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span aria-hidden className={cn('h-1 w-full', a.bar)} />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] text-ink">{p.title}</h3>
                      <p className="mb-5 mt-2 text-base leading-relaxed text-ink-3">{p.body}</p>
                      <ul className="mt-auto space-y-2.5 border-t border-line pt-5">
                        {p.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink-2">
                            <Check className={cn('mt-0.5 size-4 shrink-0', a.tick)} strokeWidth={2.5} aria-hidden />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
