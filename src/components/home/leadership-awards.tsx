import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { awards } from "@/data/seed";

/**
 * Home: the CEO and the company's awards in one section. The portrait and quote match the
 * About page (published interviews); the awards are the photos from the current Awards page.
 */
const shown = awards.filter((a) => a.id !== "mindray-ivd-2026").slice(0, 4);

export function LeadershipAwards() {
  return (
    <section className="border-t border-line bg-paper py-14 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal className="max-w-2xl">
          <p className="label">Leadership & recognition</p>
          <h2 className="display mt-4 text-[clamp(2rem,1.2rem+2.8vw,3.5rem)]">
            Our CEO and our awards
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5 lg:h-full">
            <Link
              href="/about#ceo"
              className="group relative block aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[560px] rounded-3xl bg-[#e9e6e3]"
            >
              <Image
                src="/images/ceo-emmanuel-kenney.webp"
                alt="Mr. Emmanuel Teye Kwabena Kenney, Chief Executive Officer of Flokefama"
                fill
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_21_16/0)_40%,rgb(11_21_16/0.72)_68%,rgb(11_21_16/0.94)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                <p className="max-w-sm text-lg font-light leading-snug md:text-xl">
                  “We can’t compromise on our health by using below standard
                  medical technologies.”
                </p>
                <p className="mt-4 font-semibold">
                  Emmanuel Teye Kwabena Kenney
                </p>
                <p className="text-sm text-white/70">Chief Executive Officer</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-300">
                  Meet our CEO <Icon name="fi-rr-arrow-small-right" />
                </span>
              </div>
            </Link>
          </Reveal>

          <div className="lg:col-span-7">
            <ul className="grid grid-cols-2 gap-4 md:gap-6">
              {shown.map((a, i) => (
                <li key={a.id}>
                  <Reveal delay={0.06 * i}>
                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas">
                      <Image
                        src={a.image}
                        alt={a.alt}
                        fill
                        sizes="(min-width: 1024px) 320px, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-3 text-[15px] font-semibold leading-snug text-ink md:text-base">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">{a.year}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
            <Link
              href="/awards"
              className="mt-8 inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-600"
            >
              See all awards <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
