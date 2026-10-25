import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import type { SiteContent } from '@/lib/site-content';

type Ceo = SiteContent['ceo'];

/** Puts the company's name in bold where it appears in the CEO's text. */
function withBoldName(text: string) {
  const name = 'FLOKEFAMA Company Limited';
  const at = text.indexOf(name);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-bold text-ink">{name}</strong>
      {text.slice(at + name.length)}
    </>
  );
}

/**
 * "Meet our CEO", the 'message' style (default, see ceoStyle), laid out like a leadership page: a short photo banner
 * with "Leadership" in the middle; then, on a light background, a short rule and "Message from our CEO", his profile
 * in plain paragraphs, and his creed as a quote (a grey rule on its left, quote marks above) with his name and title
 * under it. The portrait stands on the right, from the top of the text to the foot of the quote.
 */
export function CeoMessage({ ceo }: { ceo: Ceo }) {
  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28">
      <div className="relative isolate grid h-[160px] place-items-center overflow-hidden md:h-[220px]">
        <Image src="/images/office-team.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[center_35%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/35" />
        <h2 id="ceo-title" className="text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] font-bold tracking-[-0.02em] !text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.35)]">
          Leadership
        </h2>
      </div>

      <div className="bg-canvas py-12 md:py-16">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 md:px-10 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-8 text-[1.25rem] text-ink">
              <span aria-hidden className="h-0.5 w-16 bg-brand-600" />
              Message from our CEO
            </p>
            <div className="no-justify mt-5 space-y-8 text-[1.125rem] leading-[1.8] text-ink">
              {ceo.bio.map((t) => (
                <p key={t.slice(0, 40)}>{withBoldName(t)}</p>
              ))}
            </div>
            <figure className="mt-6 border-l-2 border-line pl-6">
              {/* Quote marks, drawn in outline */}
              <svg aria-hidden viewBox="0 0 56 46" className="h-12 w-14 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M14 2c-7 0-12 5-12 11.5S7 25 13 25c1.6 0 3-.3 4.2-.9C16.2 32 11.4 39 4 43l1.4 1.6C17.6 39 26 28 26 15 26 7.5 21 2 14 2Z" />
                <path d="M42 2c-7 0-12 5-12 11.5S35 25 41 25c1.6 0 3-.3 4.2-.9C44.2 32 39.4 39 32 43l1.4 1.6C45.6 39 54 28 54 15 54 7.5 49 2 42 2Z" />
              </svg>
              <blockquote className="mt-5 text-[1.125rem] leading-[1.7] text-ink">{ceo.creed}</blockquote>
              <figcaption className="mt-6">
                <span className="block text-[clamp(1.5rem,1.3rem+0.6vw,1.875rem)] font-bold tracking-[-0.01em] text-ink">{ceo.name}</span>
                <span className="mt-2 block text-ink-2">{ceo.role}</span>
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.08} className="lg:self-stretch">
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full bg-[#e9e6e3] shadow-[0_10px_30px_-18px_rgb(11_21_16/0.35)]">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
