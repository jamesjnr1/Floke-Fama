import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';

/**
 * Heroes that lead with the Flokefama brand itself. 'wordmark': the claim and actions on top, the FLOKE FAMA
 * lettering across the full width underneath. 'mark': the text on the left, the leaf mark large on the right in its
 * own colours. 'headoffice': the text and figures on the left, the head office with its FLOKE COMPANY LTD. sign on the right.
 */

const green = 'bg-[linear-gradient(180deg,#0a5a33_0%,#06482a_60%,#043822_100%)]';
const lead = 'Sterilisation, laboratory, respiratory, imaging, monitoring and emergency equipment: supplied, installed and supported for hospitals and laboratories across Ghana and West Africa since 2008.';
const proof = ['No.1 healthcare company, Ghana Club 100', 'Official Mindray distributor', 'Featured in Forbes Africa'];

function Actions({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Button asChild size="lg" arrow="up-right" className="bg-white text-[#00703A] hover:bg-white/90">
        <Link href="/products">Explore Solutions</Link>
      </Button>
      <Button asChild size="lg" variant="red" arrow="right">
        <Link href="/support">Contact Us</Link>
      </Button>
    </div>
  );
}

/** Wordmark: the claim, text and actions on top, the lettering spanning the whole width at the foot. */
export function WordmarkHero() {
  return (
    <section className={`relative isolate overflow-hidden ${green} pt-[72px] text-white`}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_80%_10%,rgb(127_209_165/0.16),transparent_70%)]" />
      <div className="mx-auto max-w-[1280px] px-5 pt-16 md:px-10 md:pt-24">
        <Reveal className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-300">
              <LogoMark className="size-7" /> Saving lives since 2008
            </p>
            <h1 className="mt-6 text-[clamp(2.25rem,1.3rem+2.8vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em] !text-white">
              Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
            </h1>
          </div>
          <div>
            <p className="no-justify text-lg leading-relaxed text-white/80">{lead}</p>
            <Actions className="mt-7" />
          </div>
        </Reveal>
        <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/65">
          {proof.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="size-1.5 bg-signal" /> {p}
            </li>
          ))}
        </ul>
        <Reveal delay={0.1} className="mt-10 pb-10 md:pb-14">
          <LogoWordmark className="h-auto w-full text-white" />
          <span className="sr-only">Flokefama</span>
        </Reveal>
      </div>
    </section>
  );
}

/** Mark: the wordmark, claim and actions on the left, the leaf mark large on the right with soft rings around it. */
export function MarkHero() {
  return (
    <section className={`relative isolate overflow-hidden ${green} pt-[72px] text-white`}>
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <h1 className="!text-white">
            <span className="flex text-[clamp(3rem,1.6rem+4vw,5rem)]">
              <LogoWordmark className="h-[0.75em] text-white" />
              <span className="sr-only">Flokefama,</span>
            </span>
            <span className="mt-5 block text-[clamp(1.75rem,1.1rem+1.9vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
              Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
            </span>
          </h1>
          <p className="no-justify mt-5 max-w-xl text-lg leading-relaxed text-white/80">{lead}</p>
          <Actions className="mt-8" />
          <ul className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {proof.map((p) => (
              <li key={p} className="border-l-2 border-signal pl-3 text-sm leading-snug text-white/75">
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="relative mx-auto grid aspect-square w-full max-w-[460px] place-items-center">
          <div aria-hidden className="absolute inset-0">
            {[100, 78, 56].map((s) => (
              <span key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12" style={{ width: `${s}%`, height: `${s}%` }} />
            ))}
          </div>
          <span className="relative grid size-[48%] place-items-center rounded-full bg-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)]">
            <LogoMark className="size-[88%]" />
          </span>
        </Reveal>
      </div>
    </section>
  );
}

/** Head office: the text and figures on the left, the building with its sign filling the right. */
export function HeadOfficeHero() {
  const figures = [
    ['700+', 'Hospitals and laboratories'],
    ['300+', 'System integrations'],
    ['6', 'Branches across Ghana'],
  ];
  return (
    <section className={`relative isolate overflow-hidden ${green} pt-[72px] text-white`}>
      <div className="grid lg:min-h-[640px] lg:grid-cols-2">
        <div className="flex items-center px-5 py-16 md:px-10 lg:py-20 lg:pl-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] lg:pr-14">
          <Reveal>
            <p className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-300">
              <LogoMark className="size-7" /> Since 2008
            </p>
            <h1 className="mt-6 !text-white">
              <span className="flex text-[clamp(2.75rem,1.6rem+3.4vw,4.5rem)]">
                <LogoWordmark className="h-[0.75em] text-white" />
                <span className="sr-only">Flokefama,</span>
              </span>
              <span className="mt-4 block text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)] font-extrabold leading-[1.08] tracking-[-0.035em]">
                Ghana’s No.1 Healthcare Company<span className="text-signal">.</span>
              </span>
            </h1>
            <p className="no-justify mt-5 text-lg leading-relaxed text-white/80">{lead}</p>
            <Actions className="mt-8" />
            <dl className="mt-10 grid grid-cols-3 gap-4">
              {figures.map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-bold tracking-[-0.03em]">{n}</dt>
                  <dd className="mt-1 text-sm text-white/65">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
        <div className="relative min-h-[320px]">
          <Image src="/images/hero-head-office.webp" alt="The Flokefama head office, with the FLOKE COMPANY LTD. sign" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-y-0 left-0 hidden w-24 bg-[linear-gradient(90deg,#06482a,transparent)] lg:block" />
        </div>
      </div>
    </section>
  );
}
