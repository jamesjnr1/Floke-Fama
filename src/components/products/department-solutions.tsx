import { Reveal } from '@/components/motion/reveal';
import { DepartmentTabs, type ResolvedDepartment } from '@/components/products/department-tabs';
import { catalogue } from '@/data/catalogue';
import { departments, labDisciplines, labPackages } from '@/data/solutions';

/** "Solutions by department": one department at a time, each with its products; shop products link to their page. */
export function DepartmentSolutions() {
  const resolved: ResolvedDepartment[] = departments.map((d) => ({
    ...d,
    groups: d.groups.map((g) => ({
      ...g,
      items: g.items.flatMap((it) => {
        if (!it.slug) return it.image ? [{ name: it.name, label: it.label, text: it.text, image: it.image }] : [];
        const p = catalogue.find((c) => c.slug === it.slug);
        return p?.image ? [{ name: it.name, label: it.label, text: it.text, image: p.image, href: `/products/${p.slug}` }] : [];
      }),
    })),
  }));
  return (
    <section id="departments" aria-labelledby="departments-title" className="scroll-mt-24 border-t border-line bg-paper section-y">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="departments-title" className="display text-[clamp(2rem,1.2rem+2.8vw,3.25rem)] lg:col-span-7">Solutions by department</h2>
          <p className="no-justify text-lg leading-relaxed text-ink-3 lg:col-span-5">Everything a department needs, from one supplier, installed and supported by our own engineers.</p>
        </Reveal>
        <DepartmentTabs departments={resolved} packages={labPackages} disciplines={labDisciplines} />
      </div>
    </section>
  );
}
