import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { branches, contact, maps } from '@/data/seed';

/** Head office photo, live map and one-tap directions, plus the branch network. */
export function VisitUs({ id = 'visit', photo = true }: { id?: string; photo?: boolean }) {
  return (
    <section id={id} className="scroll-mt-28 bg-paper py-14 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="display text-[clamp(2rem,1.2rem+2.8vw,3.75rem)]">Find Us Here!</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-3">Visit Flokefama Company Limited Head Office using the interactive map below.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {/* The building */}
          {photo && (
          <Reveal className="lg:col-span-5">
            <figure className="group relative isolate h-full min-h-[280px] overflow-hidden rounded-5xl md:min-h-[440px] bg-midnight">
              <Image
                src="/images/head-office.webp"
                alt="The Floke Company head office building in Santa Maria, Accra"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="-z-10 object-cover object-[50%_35%] transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.03]"
              />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight from-15% via-midnight/75 via-40% to-transparent to-70%" />
              <figcaption className="absolute inset-x-0 bottom-0 p-7 text-white">
                <p className="text-2xl font-bold tracking-[-0.02em]">Santa Maria, Accra</p>
                <p className="mt-1 text-sm text-white/80">{contact.address}</p>
              </figcaption>
            </figure>
          </Reveal>
          )}

          {/* The map + directions */}
          <Reveal delay={0.08} className={photo ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="flex h-full flex-col overflow-hidden rounded-5xl border border-line bg-canvas">
              <div className="relative min-h-[260px] flex-1 overflow-hidden md:min-h-[320px]">
                {/* Shown while the map loads (or if it can't): a quiet grid with the head-office pin */}
                <div aria-hidden className="absolute inset-0 grid place-items-center bg-canvas [background-image:linear-gradient(rgb(11_21_16/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(11_21_16/0.05)_1px,transparent_1px)] [background-size:32px_32px]">
                  <span className="relative grid size-14 place-items-center rounded-full bg-brand-600 text-xl text-white shadow-[0_0_0_10px_rgb(37_120_71/0.12)]"><Icon name="fi-rr-marker" /></span>
                </div>
                <iframe
                  src={maps.embed}
                  title="Map of the Flokefama head office, Santa Maria, Accra"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 size-full border-0 [filter:grayscale(1)_contrast(1.05)_brightness(1.02)]"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-600/[0.06] mix-blend-multiply" />
              </div>
              <div className="flex flex-col gap-5 border-t border-line bg-paper p-6 md:flex-row md:items-center md:justify-between md:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon name="fi-rr-marker" /></span>
                  <div>
                    <p className="font-semibold text-ink">Flokefama Company Limited</p>
                    <p className="text-sm text-ink-3">Santa Maria, Accra, Ghana</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href={maps.directions} target="_blank" rel="noopener noreferrer"><Icon name="fi-rr-navigation" /> Get directions</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={contact.phoneHref}><Icon name="fi-rr-phone-call" /> Call</a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Branches */}
        <Reveal delay={0.12}>
          <ul className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-4xl border border-line bg-line lg:grid-cols-6">
            {branches.map((b) => (
              <li key={b.name} className="bg-paper">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Flokefama ${b.name} ${b.detail} Ghana`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full p-3 transition hover:bg-canvas sm:p-5"
                >
                  <span className="flex items-center justify-between">
                    <Icon name="fi-rr-marker" className="text-brand-600" />
                    <Icon name="fi-rr-arrow-small-right" className="-rotate-45 text-ink-3 opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-3 block font-medium text-ink">{b.name}</span>
                  <span className="block text-xs text-ink-3">{b.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
