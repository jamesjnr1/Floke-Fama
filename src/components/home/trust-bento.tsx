import Image from 'next/image';
import { SectionHeading } from '@/components/home/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { IconTile } from '@/components/ui/icon';
import { distributors } from '@/data/seed';
import type { Milestone } from '@/lib/types';

/** Trust & authority architecture: milestones get premium real estate. */
export function TrustBento({ milestones }: { milestones: Milestone[] }) {
  const [feature, ...rest] = milestones;
  return (
    <section id="trust" className="scroll-mt-20 py-28 md:py-40">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionHeading label="Trust & authority" title={<>Recognised at home. <span className="text-ink-3">Awarded abroad.</span></>} />

        <div className="mt-16 grid gap-4 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(260px,auto))]">
          {feature && (
            <Reveal className="group relative isolate min-h-[420px] overflow-hidden rounded-5xl bg-midnight md:col-span-4 md:row-span-2">
              {feature.image && (
                <Image src={feature.image} alt="Flokefama team receiving the Mindray IVD award on stage in Nairobi" fill sizes="(min-width: 768px) 66vw, 100vw" className="-z-10 object-cover object-[50%_40%] transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.04]" />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
              <div className="flex h-full flex-col justify-end p-8 md:p-12">
                <p className="label !text-surgical-300">{feature.kicker}</p>
                <h3 className="display mt-4 max-w-lg text-4xl text-white md:text-6xl">{feature.title}</h3>
                <p className="mt-4 max-w-md font-light text-white/70">{feature.body}</p>
              </div>
            </Reveal>
          )}

          {rest.slice(0, 2).map((m, i) => (
            <Reveal key={m.id} delay={0.1 * (i + 1)} className="flex flex-col justify-between rounded-5xl border border-line bg-paper p-8 md:col-span-2">
              <IconTile name={m.icon} />
              <div className="mt-10">
                <p className="label">{m.kicker}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink-3">{m.body}</p>
              </div>
            </Reveal>
          ))}

          {rest[2] && (
            <Reveal delay={0.1} className="flex flex-col justify-between gap-8 rounded-5xl border border-line bg-paper p-8 md:col-span-3 md:flex-row md:items-end">
              <div>
                <IconTile name={rest[2].icon} />
                <p className="label mt-10">{rest[2].kicker}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{rest[2].title}</h3>
                <p className="mt-2 max-w-sm text-sm font-light leading-relaxed text-ink-3">{rest[2].body}</p>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.2} className="relative overflow-hidden rounded-5xl bg-surgical-600 p-8 text-white md:col-span-3">
            <div className="grid-fade absolute inset-0 opacity-60" />
            <p className="label relative !text-white/60">Official distributor</p>
            <ul className="relative mt-6 space-y-1">
              {distributors.map((d) => (
                <li key={d} className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-4xl">{d}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
