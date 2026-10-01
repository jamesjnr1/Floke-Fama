import Image from 'next/image';
import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';
import { awards, companyFigures } from '@/data/seed';
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
    <section className="bg-canvas pb-4 pt-24 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal>
          <p className="label">Awards &amp; recognition</p>
          <h2 className="display mt-4 max-w-3xl text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">We are proud to share some of the awards that celebrate our passion and progress.</h2>
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
                    <p className={cn('mt-2 font-light text-white/70', l.feature ? 'max-w-lg' : 'text-sm')}>{a.body}</p>
                  </div>
                </article>
              </Reveal>
            </li>
            );
          })}
        </ul>
        <Reveal>
          <p className="mx-auto mt-16 max-w-3xl text-center text-xl font-light leading-relaxed text-ink-3 md:text-2xl">
            These accolades serve as a testament to the <span className="font-medium text-ink">hard work of our team</span>, the{' '}
            <span className="font-medium text-ink">quality of our solutions</span>, and the <span className="font-medium text-brand-700">positive impact we’ve made in transforming healthcare delivery across Ghana and the West African region</span>.
          </p>
        </Reveal>

        {/* Figures from the current Awards page */}
        <Reveal className="mt-20 grid gap-10 border-t border-line pt-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label">Flokefama</p>
            <h3 className="mt-3 text-balance text-2xl font-bold tracking-[-0.02em] text-ink md:text-[2.125rem] md:leading-tight">Innovative Solutions for Better Health Outcomes</h3>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-line lg:col-span-7">
            {companyFigures.map((f, i) => (
              <div key={f.label} className={cn('flex flex-col-reverse justify-end gap-2 px-4 md:px-8', i === 0 && '!pl-0')}>
                <dt className="text-sm text-ink-3 md:text-[15px]">{f.label}</dt>
                <dd className="text-[clamp(2.25rem,1.6rem+2.4vw,3.75rem)] font-bold leading-none tracking-[-0.04em] text-brand-600">
                  <CountUp value={f.value} suffix={f.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
