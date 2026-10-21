import Image from 'next/image';
import { AwardsShowcase } from '@/components/awards/awards-showcase';
import { Reveal } from '@/components/motion/reveal';
import { getSite } from '@/lib/site';

/** Switch with NEXT_PUBLIC_AWARDS_LAYOUT=wall in Vercel (then redeploy); the showcase is the default. */
const layout = process.env.NEXT_PUBLIC_AWARDS_LAYOUT === 'wall' ? 'wall' : 'showcase';

/** The actual awards, photographed: the No.1 healthcare ranking leads. */
export async function AwardsGallery() {
  const { awards } = await getSite();
  const closing = (
    <>
      These accolades serve as a testament to the <span className="font-medium text-ink">hard work of our team</span>, the{' '}
      <span className="font-medium text-ink">quality of our solutions</span>, and the <span className="font-medium text-brand-700">positive impact we’ve made in transforming healthcare delivery across Ghana and the West African region</span>.
    </>
  );

  if (layout === 'wall') {
    // A dark wall of framed awards: each photo on a white mat, its caption underneath
    return (
      <section aria-labelledby="awards-title" className="bg-midnight section-y text-white">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <h2 id="awards-title" className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)] text-white">
              We are proud to share some of the awards that celebrate our passion and progress.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((a, i) => (
              <li key={a.id}>
                <Reveal delay={Math.min(i % 3, 2) * 0.05}>
                  <div className="bg-white p-3">
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={a.image} alt={a.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover object-[50%_35%]" />
                    </div>
                  </div>
                  <p className="label mt-5 !text-brand-300">{a.year}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-white">{a.title}</h3>
                  <p className="mt-2 leading-relaxed text-white/70">{a.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <p className="mx-auto mt-16 max-w-3xl text-center text-xl leading-relaxed text-white/70 md:text-2xl [&_span]:!text-white">{closing}</p>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="awards-title" className="pattern-cross pattern-tr bg-canvas section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <h2 id="awards-title" className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">
            We are proud to share some of the awards that celebrate our passion and progress.
          </h2>
        </Reveal>
        <Reveal className="mt-10 md:mt-14">
          <AwardsShowcase awards={awards} />
        </Reveal>
        <Reveal>
          <p className="mx-auto mt-16 max-w-3xl text-center text-xl leading-relaxed text-ink-3 md:text-2xl">{closing}</p>
        </Reveal>
      </div>
    </section>
  );
}
