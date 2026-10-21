import Image from 'next/image';
import { AwardsFilmstrip } from '@/components/awards/awards-filmstrip';
import { Reveal } from '@/components/motion/reveal';

export type AwardItem = { id: string; title: string; body: string; year: string; image: string; alt: string };
type Props = { awards: AwardItem[] };

const intro = 'We are proud to share some of the awards that celebrate our passion and progress.';
const Closing = () => (
  <>
    These accolades serve as a testament to the hard work of our team, the quality of our solutions, and the positive impact we’ve made in transforming
    healthcare delivery across Ghana and the West African region.
  </>
);

/** Editorial: the lead award large, then the rest as roomy rows (year, photo, story) on alternating tints. */
export function AwardsEditorial({ awards }: Props) {
  const [lead, ...rest] = awards;
  if (!lead) return null;
  return (
    <section aria-labelledby="awards-title" className="pattern-cross pattern-tr bg-white section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="grid gap-6 md:grid-cols-2 md:items-end md:gap-16">
          <h2 id="awards-title" className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">{intro}</h2>
          <p className="no-justify text-lg leading-relaxed text-ink-3"><Closing /></p>
        </Reveal>

        <Reveal className="mt-12 grid overflow-hidden bg-brand-800 text-white md:mt-16 md:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[460px]">
            <Image src={lead.image} alt={lead.alt} fill sizes="(min-width: 768px) 700px, 100vw" className="object-cover object-[50%_35%]" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-14">
            <p className="label !text-brand-300">{lead.year}</p>
            <h3 className="display mt-3 text-[clamp(1.75rem,1.2rem+1.8vw,3rem)] text-white">{lead.title}</h3>
            <p className="no-justify mt-4 text-lg leading-relaxed text-white/80">{lead.body}</p>
          </div>
        </Reveal>

        <ol className="mt-6 space-y-3">
          {rest.map((a, i) => (
            <li key={a.id}>
              <Reveal className={`grid items-center gap-5 p-5 sm:grid-cols-[200px_1fr] md:grid-cols-[110px_240px_1fr] md:gap-10 md:p-6 ${i % 2 ? 'bg-white' : 'bg-canvas'}`}>
                <p className="font-extrabold leading-none tracking-[-0.04em] text-brand-700 text-3xl max-md:hidden">{/^\d{4}$/.test(a.year) ? a.year : '—'}</p>
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  <Image src={a.image} alt={a.alt} fill sizes="240px" className="object-cover object-[50%_35%]" />
                </div>
                <div>
                  <p className="label md:hidden">{a.year}</p>
                  <h3 className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink md:mt-0 md:text-2xl">{a.title}</h3>
                  <p className="no-justify mt-2 max-w-2xl leading-relaxed text-ink-3">{a.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Filmstrip: on the company green, a row of tall award cards to swipe or step through. */
export function AwardsFilmstripSection({ awards }: Props) {
  return (
    <section aria-labelledby="awards-title" className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)] section-y text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_80%_0%,rgb(127_209_165/0.16),transparent_70%)]" />
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label !text-brand-300">{awards.length} awards &amp; recognitions</p>
          <h2 id="awards-title" className="display mt-3 max-w-2xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-white">{intro}</h2>
        </Reveal>
        <AwardsFilmstrip awards={awards} />
        <Reveal>
          <p className="no-justify mt-14 max-w-3xl text-xl leading-relaxed text-white/80 md:text-2xl"><Closing /></p>
        </Reveal>
      </div>
    </section>
  );
}

/** Sticky split: the introduction and the count stay put on the left while the awards scroll by on the right. */
export function AwardsSticky({ awards }: Props) {
  return (
    <section aria-labelledby="awards-title" className="pattern-dots pattern-bl bg-canvas section-y">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-[5fr_7fr] md:gap-20 md:px-10">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <p className="font-extrabold leading-none tracking-[-0.05em] text-brand-700 text-[clamp(5rem,3rem+6vw,8.5rem)]">
            {String(awards.length).padStart(2, '0')}
            <span className="text-signal">.</span>
          </p>
          <p className="label mt-2">Awards &amp; recognitions</p>
          <h2 id="awards-title" className="display mt-6 text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)]">{intro}</h2>
          <p className="no-justify mt-6 text-lg leading-relaxed text-ink-3"><Closing /></p>
        </Reveal>
        <ul className="space-y-12 md:space-y-16">
          {awards.map((a) => (
            <li key={a.id}>
              <Reveal>
                <div className="relative aspect-[16/11] overflow-hidden bg-white">
                  <Image src={a.image} alt={a.alt} fill sizes="(min-width: 768px) 700px, 100vw" className="object-cover object-[50%_35%]" />
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <p className="label pt-1.5">{a.year}</p>
                  <div>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] text-ink">{a.title}</h3>
                    <p className="no-justify mt-2 leading-relaxed text-ink-3">{a.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Podium: the top three as tall photo cards (the middle raised), then the rest as a compact list beside small photos. */
export function AwardsPodium({ awards }: Props) {
  const top = awards.slice(0, 3);
  const rest = awards.slice(3);
  // Middle card is the lead award (No.1), flanked by the next two
  const order = top.length === 3 ? [top[1], top[0], top[2]] : top;
  return (
    <section aria-labelledby="awards-title" className="pattern-cross pattern-tr bg-canvas section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="awards-title" className="display text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">{intro}</h2>
        </Reveal>
        <ul className="swipe-row mt-12 md:mt-16 md:grid-cols-3 md:items-end md:gap-6">
          {order.map((a) => {
            const lead = a === top[0];
            return (
              <li key={a.id}>
                <Reveal>
                  <article className={`relative isolate flex overflow-hidden bg-midnight text-white ${lead ? 'h-[440px] md:h-[560px]' : 'h-[440px] md:h-[480px]'}`}>
                    <Image src={a.image} alt={a.alt} fill sizes="(min-width: 768px) 420px, 84vw" className="-z-10 object-cover object-[50%_35%]" />
                    <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
                    <div className="mt-auto p-7">
                      <p className="label !text-brand-300">{a.year}</p>
                      <h3 className={`mt-2 font-bold tracking-[-0.02em] text-white ${lead ? 'text-3xl' : 'text-xl'}`}>{a.title}</h3>
                      <p className="no-justify mt-2 text-sm leading-relaxed text-white/80">{a.body}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
        {rest.length > 0 && (
          <>
            <Reveal>
              <h3 className="mt-16 text-2xl font-bold tracking-[-0.02em] text-ink md:mt-20">More recognition</h3>
            </Reveal>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {rest.map((a) => (
                <li key={a.id}>
                  <Reveal className="flex h-full gap-5 bg-white p-4">
                    <div className="relative aspect-square w-28 shrink-0 overflow-hidden md:w-32">
                      <Image src={a.image} alt={a.alt} fill sizes="128px" className="object-cover object-[50%_35%]" />
                    </div>
                    <div className="py-1">
                      <p className="label">{a.year}</p>
                      <h4 className="mt-1.5 text-lg font-bold tracking-[-0.02em] text-ink">{a.title}</h4>
                      <p className="no-justify mt-1 text-[0.9375rem] leading-relaxed text-ink-3">{a.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </>
        )}
        <Reveal>
          <p className="no-justify mx-auto mt-16 max-w-3xl text-center text-xl leading-relaxed text-ink-3 md:text-2xl"><Closing /></p>
        </Reveal>
      </div>
    </section>
  );
}
