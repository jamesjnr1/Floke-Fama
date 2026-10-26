import Image from 'next/image';
import { accents } from '@/components/home/capabilities';
import { Reveal } from '@/components/motion/reveal';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

/** The pillars' accents, in turn, so the award cards read as a set like the pillars. */
const tones = ['green', 'teal', 'blue', 'slate', 'red', 'amber'] as const;

/**
 * The actual awards, photographed, laid out like the six pillars on the home page: a short label and the heading on
 * white, then equal cards three to a row, large, each with the photo, the year, a coloured rule, the
 * award and one line on it. The No.1 healthcare ranking leads.
 */
export async function AwardsGallery() {
  const site = await getSite();
  // Newest first (2026, 2025, 2024…); awards without a year (an honorary membership) last, the rest in their own order
  const yearOf = (y: string) => Number(/\d{4}/.exec(y)?.[0] ?? 0);
  const awards = [...site.awards].sort((a, b) => yearOf(b.year) - yearOf(a.year));
  return (
    <section aria-labelledby="awards-title" className="relative isolate overflow-hidden bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="inline-block w-fit bg-brand-50 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-brand-700">Awards &amp; recognition</p>
            <h2 id="awards-title" className="display mt-4 max-w-2xl text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] text-ink">
              Celebrating our <span className="text-brand-600">passion and progress.</span>
            </h2>
          </div>
          <p className="no-justify max-w-md text-lg leading-relaxed text-ink-3">We are proud to share some of the awards that recognise our team and the work we do.</p>
        </Reveal>

        <ol className="swipe-row mt-10 gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {awards.map((a, i) => {
            const t = accents[tones[i % tones.length]];
            return (
              <li key={a.id}>
                <Reveal delay={Math.min(i, 5) * 0.05} className="h-full">
                  <article className="group flex h-full flex-col overflow-hidden border border-line bg-paper shadow-[0_24px_50px_-36px_rgb(11_21_16/0.35)]">
                    <div className="relative aspect-[4/3.4] overflow-hidden bg-midnight">
                      <Image
                        src={a.image}
                        alt={a.alt}
                        fill
                        sizes="(min-width: 1024px) 440px, (min-width: 768px) 50vw, 84vw"
                        className="object-cover object-[50%_35%] transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      />
                      <span className={cn('absolute left-4 top-4 px-3.5 py-1.5 text-base font-bold text-white', t.num)}>{a.year}</span>
                    </div>
                    <span aria-hidden className={cn('h-1 w-full', t.bar)} />
                    <div className="flex flex-1 flex-col p-7">
                      <h3 className="text-[1.375rem] font-bold leading-snug tracking-[-0.02em] text-ink">{a.title}</h3>
                      <p className="no-justify mt-2.5 text-[1.0625rem] leading-relaxed text-ink-3">{a.body}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal>
          <p className="mx-auto mt-14 max-w-3xl text-center !text-center text-xl leading-relaxed text-ink-3 [text-align-last:center] md:text-2xl">
            These accolades serve as a testament to the <span className="font-medium text-ink">hard work of our team</span>, the{' '}
            <span className="font-medium text-ink">quality of our solutions</span>, and the <span className="font-medium text-brand-700">positive impact we’ve made in transforming healthcare delivery across Ghana and the West African region</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
