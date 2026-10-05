import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { awards } from '@/data/seed';
import { cn } from '@/lib/utils';

/** Bento spans for five awards on a 6-column grid: feature + two stacked, then a 2 + 4 row. */
const layout = [
  { span: 'md:col-span-4 md:row-span-2', height: 'min-h-[340px] md:min-h-[520px]', sizes: '(min-width: 768px) 66vw, 100vw', feature: true },
  { span: 'md:col-span-2', height: 'min-h-[340px] md:min-h-[300px]', sizes: '(min-width: 768px) 33vw, 100vw' },
  { span: 'md:col-span-2', height: 'min-h-[340px] md:min-h-[300px]', sizes: '(min-width: 768px) 33vw, 100vw' },
  { span: 'md:col-span-2', height: 'min-h-[340px] md:min-h-[380px]', sizes: '(min-width: 768px) 33vw, 100vw' },
  { span: 'md:col-span-4', height: 'min-h-[340px] md:min-h-[380px]', sizes: '(min-width: 768px) 66vw, 100vw' },
];

/** The actual awards, photographed: the No.1 healthcare ranking leads. */
export function AwardsGallery() {
  return (
    <section className="bg-canvas pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <h2 className="display max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">We are proud to share some of the awards that celebrate our passion and progress.</h2>
        </Reveal>
        <ul className="swipe-row mt-10 gap-4 md:mt-12 md:grid-cols-6">
          {awards.map((a, i) => {
            const l = layout[i] ?? layout[1];
            return (
            <li key={a.id} className={l.span}>
              <Reveal delay={Math.min(i, 4) * 0.05} className="h-full">
                <article className={cn('group relative isolate flex h-full overflow-hidden rounded-4xl bg-midnight text-white', l.height)}>
                  <Image
                    src={a.image}
                    alt={a.alt}
                    fill
                    sizes={l.sizes}
                    className="-z-10 object-cover object-[50%_35%] transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.04]"
                  />
                  <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
                  <div className="mt-auto p-6 md:p-8">
                    <p className="label !text-brand-300">{a.year}</p>
                    <h3 className={cn('mt-2 font-bold tracking-[-0.02em] text-white', l.feature ? 'text-3xl md:text-5xl' : 'text-xl')}>{a.title}</h3>
                    <p className={cn('mt-2 text-white/80', l.feature ? 'max-w-lg' : 'text-sm')}>{a.body}</p>
                  </div>
                </article>
              </Reveal>
            </li>
            );
          })}
        </ul>
        <Reveal>
          <p className="mx-auto mt-16 max-w-3xl text-center text-xl leading-relaxed text-ink-3 md:text-2xl">
            These accolades serve as a testament to the <span className="font-medium text-ink">hard work of our team</span>, the{' '}
            <span className="font-medium text-ink">quality of our solutions</span>, and the <span className="font-medium text-brand-700">positive impact we’ve made in transforming healthcare delivery across Ghana and the West African region</span>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
