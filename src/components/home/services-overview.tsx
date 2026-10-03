import Link from "next/link";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Icon, IconTile } from "@/components/ui/icon";
import { servicesInBrief } from "@/data/seed";

/**
 * Home: what Flokefama does beyond selling equipment. The six services and their one-line
 * descriptions are the "Our Services" list from the current About page; the full lifecycle
 * lives on /services.
 */
export function ServicesOverview() {
  return (
    <section
      aria-labelledby="services-overview-title"
      className="border-y border-line bg-paper py-16 md:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-5 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            label="Our services"
            title={
              <span id="services-overview-title">End&#8209;to&#8209;end solutions</span>
            }
            lead="From procurement and installation to training and maintenance."
          />
          <Reveal>
            <Button asChild variant="outline">
              <Link href="/services">
                See all services <Icon name="fi-rr-arrow-small-right" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
          {servicesInBrief.map((s, i) => (
            <li key={s.title} className="bg-paper">
              <Reveal delay={0.05 * i} className="flex h-full gap-4 p-5 md:gap-5 md:p-8">
                <IconTile name={s.icon} />
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-3">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
