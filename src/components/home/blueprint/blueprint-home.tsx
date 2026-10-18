import Image from 'next/image';
import Link from 'next/link';
import { Backdrop } from '@/components/home/blueprint/backdrop';
import { Reveal } from '@/components/motion/reveal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { equipment } from '@/data/equipment';
import { metrics } from '@/data/seed';
import { getSite } from '@/lib/site';
import { cn } from '@/lib/utils';

const title = 'text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink';
const lead = 'no-justify mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-3';

function SectionHead({ heading, text }: { heading: string; text: string }) {
  return (
    <Reveal className="text-center">
      <h2 className={title}>{heading}</h2>
      <p className={lead}>{text}</p>
    </Reveal>
  );
}

/** Same visual area for every logo. */
function box(w: number, h: number, area = 5200, maxW = 150, maxH = 54) {
  const r = w / h;
  let height = Math.min(Math.sqrt(area / r), maxH);
  let width = height * r;
  if (width > maxW) {
    width = maxW;
    height = width / r;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

/** The four highlighted equipment areas, two wide and two narrow, as in the wireframe. */
const highlights = [
  { slug: 'mri', heading: 'Diagnostic imaging', text: 'MRI, CT and digital X-ray systems, supplied, installed and maintained.', span: 'md:col-span-7' },
  { slug: 'mammography', heading: 'Women’s health', text: 'Digital mammography for screening and the early detection of breast cancer.', span: 'md:col-span-5' },
  { slug: 'dialysis', heading: 'Renal care', text: 'Haemodialysis systems for safe, reliable treatment of kidney failure.', span: 'md:col-span-5' },
  { slug: 'incubator', heading: 'Neonatal and critical care', text: 'Incubators and ventilators for newborns, intensive care and theatres.', span: 'md:col-span-7' },
];

/**
 * The 'blueprint' home page (see homeLayout), following the wireframe: hero with a photo, partner logos, highlighted
 * equipment, why us, reviews, FAQs and a closing call to action. Light sections carry a faint pattern (Backdrop).
 */
export async function BlueprintHome() {
  const site = await getSite();
  const { hero, technologyPartners, clients, whyChoose, testimonials, faqs } = site;
  const logos = [...technologyPartners, ...clients].filter((l) => l.logo).slice(0, 8);
  const served = metrics[0];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-canvas pb-16 pt-[120px] md:pb-20 lg:pt-[136px]">
        <Backdrop variant="grid" at="15% 20%" />
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink-2">
              <span className="size-2 bg-brand-600" aria-hidden /> {served.value}
              {served.suffix} hospitals and laboratories served
            </span>
            <h1 className="mt-6 text-[clamp(2.5rem,1.4rem+3.4vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
              {hero.title} {hero.highlight.replace(/\.$/, '')}<span className="text-signal">.</span>
            </h1>
            <p className="no-justify mt-6 max-w-xl text-lg leading-relaxed text-ink-3">
              From MRI and CT to dialysis, neonatal and critical care: medical equipment supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" arrow="up-right">
                <Link href="/products">Explore Solutions</Link>
              </Button>
              <Button asChild size="lg" variant="red" arrow="right">
                <Link href="/support">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <figure className="relative aspect-[4/3.4] overflow-hidden bg-mist">
              <Image src="/images/equipment/mri.webp" alt="An MRI scanner in a clinical room" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </figure>
          </Reveal>
        </div>

        {/* Partners */}
        <div className="mx-auto mt-16 max-w-[1280px] px-5 md:mt-20 md:px-10">
          <p className="text-center text-sm font-medium text-ink-3">Trusted by hospitals and partners across Ghana</p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((l) => {
              const b = box(l.w, l.h);
              return (
                <li key={l.name}>
                  <Image src={l.logo!} alt={l.name} width={b.width} height={b.height} style={{ width: b.width, height: b.height }} className="object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Features: the equipment we supply */}
      <section className="relative isolate overflow-hidden bg-paper section-y">
        <Backdrop variant="dots" at="85% 10%" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionHead heading="What we supply" text="The equipment hospitals and laboratories rely on, with installation, training and service on everything we supply." />
          <div className="mt-12 grid gap-4 md:grid-cols-12">
            {highlights.map((h, i) => {
              const e = equipment.find((x) => x.slug === h.slug)!;
              return (
                <Reveal key={h.slug} delay={i * 0.05} className={h.span}>
                  <Link href="/services#equipment" className="group relative block aspect-[16/10] overflow-hidden bg-mist md:aspect-auto md:h-[320px]">
                    <Image src={e.image} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(transparent,rgb(4_30_18/0.82))]" />
                    <span className="absolute inset-x-6 bottom-6 text-white">
                      <span className="block text-2xl font-bold tracking-[-0.02em]">{h.heading}</span>
                      <span className="mt-1.5 block max-w-md text-[0.9375rem] leading-relaxed text-white/85">{h.text}</span>
                    </span>
                    {e.credit && <span className="absolute right-2 top-2 bg-black/40 px-1.5 text-[0.625rem] text-white/85">Photo: {e.credit.author}, {e.credit.license}</span>}
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="relative isolate overflow-hidden bg-canvas section-y">
        <Backdrop variant="cross" at="10% 90%" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionHead heading="Why choose Flokefama" text="Since 2008, hospitals across Ghana have trusted us to equip them and keep their equipment running." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.slice(0, 4).map((w, i) => (
              <Reveal key={w.title} delay={i * 0.05}>
                <div className="h-full border border-line bg-paper p-6">
                  <span className="grid size-11 place-items-center bg-brand-50 text-xl text-brand-700">
                    <Icon name={w.icon} />
                  </span>
                  <p className="mt-8 text-lg font-bold leading-snug tracking-[-0.01em] text-ink">{w.title}</p>
                  <p className="no-justify mt-2 text-[0.9375rem] leading-relaxed text-ink-3">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="relative isolate overflow-hidden bg-paper section-y">
        <Backdrop variant="dots" at="50% 0%" />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionHead heading="What our clients say" text="Hospitals, clinics and laboratories on working with Flokefama." />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t, i) => (
              <Reveal key={t.name} delay={i * 0.05}>
                <figure className="flex h-full flex-col border border-line bg-paper p-7">
                  <span className="flex gap-1 text-signal" aria-label="5 out of 5">
                    {Array.from({ length: 5 }, (_, k) => <Icon key={k} name="fi-rr-star" />)}
                  </span>
                  <blockquote className="no-justify mt-5 flex-1 text-[1.0625rem] leading-relaxed text-ink-2">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                    <span className="grid size-11 shrink-0 place-items-center bg-brand-600 text-sm font-bold text-white">
                      {t.name.replace(/^Dr\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{t.name}</span>
                      <span className="block text-sm text-ink-3">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative isolate overflow-hidden bg-canvas section-y">
        <Backdrop variant="grid" at="0% 0%" />
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 className={title}>Questions we’re often asked</h2>
            <p className="no-justify mt-4 max-w-md text-lg leading-relaxed text-ink-3">Prices, demonstrations, delivery and service. Anything else, call or message us.</p>
            <Link href="/support" className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800">
              See all FAQs <Icon name="fi-rr-arrow-small-right" />
            </Link>
          </Reveal>
          <Reveal delay={0.06} className="lg:col-span-7">
            <div className="divide-y divide-line border-y border-line bg-paper">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.q} className="group px-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Icon name="fi-rr-plus" className="shrink-0 text-ink-3 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="no-justify pb-6 text-base leading-relaxed text-ink-3">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-paper pb-20 md:pb-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <Reveal>
            <div className={cn('relative isolate grid overflow-hidden bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] text-white lg:grid-cols-2')}>
              <Backdrop variant="cross" at="0% 100%" className="invert" />
              <div className="px-8 py-14 md:px-14 md:py-20">
                <h2 className="text-[clamp(2rem,1.3rem+2.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white">Equip your facility with confidence.</h2>
                <p className="no-justify mt-4 max-w-md text-lg leading-relaxed text-white/85">Tell us what you need. Our team will recommend the right equipment, quote it and look after it for years.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" arrow="right" className="bg-white text-[#00703A] hover:bg-white/90">
                    <Link href="/support">Get in touch</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden min-h-[360px] lg:block lg:m-10 lg:ml-0">
                <div className="absolute bottom-0 left-0 top-12 w-[48%] overflow-hidden bg-mist">
                  <Image src="/images/equipment/ultrasound.webp" alt="" fill sizes="25vw" className="object-cover" />
                </div>
                <div className="absolute bottom-12 right-0 top-0 w-[48%] overflow-hidden bg-mist">
                  <Image src="/images/equipment/ventilator.webp" alt="" fill sizes="25vw" className="object-cover" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
