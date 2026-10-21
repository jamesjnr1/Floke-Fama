'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import type { Department } from '@/data/solutions';
import { cn } from '@/lib/utils';

export type ResolvedItem = { name: string; label: string; text?: string; image: string; href?: string; photo?: boolean; credit?: { author: string; license: string; source: string } };
export type ResolvedDepartment = Omit<Department, 'groups'> & { groups: { title: string; points?: string[]; items: ResolvedItem[] }[] };
type Packages = { tier: string; models: string[]; samples: string[] }[];
type Disciplines = { name: string; tests: string }[];

/** A product on white, its photo shown whole; shop products open their page. */
function Card({ it }: { it: ResolvedItem }) {
  const body = (
    <>
      <span className="relative block aspect-[4/3] overflow-hidden bg-white">
        <Image src={it.image} alt={it.name} fill sizes="(min-width: 1024px) 280px, 50vw" className={cn('transition-transform duration-500 group-hover:scale-[1.04]', it.photo ? 'object-cover' : 'object-contain p-4 mix-blend-multiply')} />
      </span>
      <span className="block border-t border-line p-4">
        <span className="block text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-brand-700">{it.label}</span>
        <span className="mt-1 block text-lg font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-brand-700">{it.name}</span>
        {it.text && <span className="no-justify mt-1 block text-[0.9375rem] leading-relaxed text-ink-3">{it.text}</span>}
        {it.credit && (
          <span className="mt-2 block text-[0.8125rem] text-ink-3">
            Photo: <a href={it.credit.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand-700">{it.credit.author}</a>, {it.credit.license}
          </span>
        )}
        {it.href && <span className="mt-2 inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-brand-700">View product <Icon name="fi-rr-arrow-small-right" /></span>}
      </span>
    </>
  );
  return (
    <li className="border border-line bg-paper transition-colors hover:border-brand-600">
      {it.href ? <Link href={it.href} className="group block h-full">{body}</Link> : <div className="group h-full">{body}</div>}
    </li>
  );
}

export function DepartmentTabs({ departments, packages, disciplines }: { departments: ResolvedDepartment[]; packages: Packages; disciplines: Disciplines }) {
  const [active, setActive] = useState(departments[0].id);
  const d = departments.find((x) => x.id === active) ?? departments[0];
  return (
    <div className="mt-10">
      <div role="tablist" aria-label="Departments" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {departments.map((x) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            aria-selected={x.id === active}
            aria-controls={`dept-${x.id}`}
            onClick={() => setActive(x.id)}
            className={cn('shrink-0 border px-4 py-2.5 text-[0.9375rem] font-semibold transition-colors', x.id === active ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-paper text-ink-2 hover:border-brand-600 hover:text-brand-700')}
          >
            {x.name}
          </button>
        ))}
      </div>

      <div id={`dept-${d.id}`} role="tabpanel" className="mt-8">
        <h3 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-3xl">{d.title}</h3>
        <p className="no-justify mt-2 max-w-3xl text-lg leading-relaxed text-ink-3">{d.text}</p>

        {d.groups.map((g) => (
          <div key={g.title} className="mt-10">
            {d.groups.length > 1 && <h4 className="border-b border-line pb-3 text-lg font-semibold text-ink">{g.title}</h4>}
            {g.points && (
              <ul className="mt-4 grid gap-2 md:grid-cols-3 md:gap-6">
                {g.points.map((t) => (
                  <li key={t} className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink-3">
                    <span aria-hidden className="mt-[0.65em] size-1.5 shrink-0 bg-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <ul className={cn('mt-5 grid grid-cols-2 gap-3 md:gap-4', g.items.length === 1 ? 'md:max-w-sm md:grid-cols-1' : 'lg:grid-cols-4')}>
              {g.items.map((it) => <Card key={it.name} it={it} />)}
            </ul>
          </div>
        ))}

        {d.id === 'laboratory' && (
          <div className="mt-14">
            <h4 className="text-2xl font-bold tracking-[-0.02em] text-ink">Complete lab packages, by daily workload</h4>
            <p className="no-justify mt-2 max-w-3xl text-lg leading-relaxed text-ink-3">A haematology, biochemistry and immunoassay analyser matched to the number of samples your lab runs each day.</p>
            <div className="mt-6 overflow-x-auto border border-line">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-midnight text-white">
                  <tr>
                    <th className="px-5 py-4 text-[0.9375rem] font-semibold">Discipline</th>
                    {packages.map((p) => <th key={p.tier} className="px-5 py-4 text-[0.9375rem] font-semibold">{p.tier}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-paper">
                  {disciplines.map((dis, i) => (
                    <tr key={dis.name} className="align-top">
                      <th scope="row" className="px-5 py-4">
                        <span className="block font-semibold text-ink">{dis.name}</span>
                        <span className="mt-0.5 block text-[0.9375rem] font-normal text-ink-3">{dis.tests}</span>
                      </th>
                      {packages.map((p) => (
                        <td key={p.tier} className="px-5 py-4">
                          <span className="block font-semibold text-ink">{p.models[i]}</span>
                          <span className="mt-0.5 block text-[0.9375rem] text-ink-3">{p.samples[i]} samples a day</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
