import { Reveal } from '@/components/motion/reveal';
import { Icon } from '@/components/ui/icon';
import { coreValues } from '@/data/seed';

/** Core values, all four at a glance in a 2 × 2 grid: icon, name and the statement from the About page. */
export function CoreValues() {
  return (
    <ol className="mt-12 grid gap-5 md:grid-cols-2">
      {coreValues.map((v, i) => (
        <li key={v.title}>
          <Reveal delay={i * 0.05} className="flex h-full gap-5 rounded-2xl border border-line bg-paper p-6 md:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-xl text-white"><Icon name={v.icon} /></span>
            <div>
              <h3 className="text-2xl font-bold text-ink">{v.title}</h3>
              <p className="no-justify mt-3 text-lg leading-relaxed text-ink-2">{v.text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
