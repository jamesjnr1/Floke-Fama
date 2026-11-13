import Image from 'next/image';
import { Icon } from '@/components/ui/icon';

export type CsrArea = { id: string; n: string; title: string; projects: string[]; image: string; position?: string };

/** The CSR page's three areas as photo cards under the opening section, each jumping to its area's heading band. */
export function CsrAreaNav({ areas }: { areas: CsrArea[] }) {
  return (
    <nav aria-label="Our CSR areas" className="border-t border-line bg-paper py-10 md:py-14">
      <ul className="mx-auto grid max-w-[1280px] gap-3 px-5 md:grid-cols-3 md:gap-4 md:px-10">
        {areas.map((a) => (
          <li key={a.id}>
            <a href={`#${a.id}`} className="group relative isolate flex h-48 flex-col justify-end overflow-hidden bg-midnight p-6 text-white md:h-64 md:p-7">
              <Image src={a.image} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="-z-10 object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" style={{ objectPosition: a.position ?? '50% 50%' }} />
              <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(6_20_14/0.15)_0%,rgb(6_20_14/0.55)_45%,rgb(6_20_14/0.9)_100%)]" />
              <span className="flex items-center justify-between text-[0.9375rem] font-semibold tabular-nums text-white/80">
                {a.n}
                <span>{a.projects.length} projects</span>
              </span>
              <span className="mt-2 flex items-end justify-between gap-3">
                <span className="text-2xl font-bold leading-tight tracking-[-0.02em]">{a.title}</span>
                <span className="grid size-10 shrink-0 place-items-center bg-white text-lg text-brand-700 transition-transform group-hover:translate-y-0.5">
                  <Icon name="fi-rr-arrow-small-right" className="rotate-90" />
                </span>
              </span>
              <span className="mt-2 line-clamp-1 text-[0.9375rem] text-white/75">{a.projects.join(' · ')}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
