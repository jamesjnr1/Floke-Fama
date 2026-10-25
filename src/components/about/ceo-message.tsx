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
 * with "Leadership" in the middle; then, on a light background, "Message from our CEO" in bold, his name and title,
 * and his profile in plain paragraphs beside the portrait. Underneath, at full width: Education and Honours in two
 * columns, then Philanthropy & Purpose, closed by his creed as a large quote under quote marks.
 */
export function CeoMessage({ ceo }: { ceo: Ceo }) {
  const list = (items: Ceo['education']) => (
    <ul className="space-y-5">
      {items.map((x) => (
        <li key={x.title}>
          <p className="text-lg font-semibold text-ink">{x.title}</p>
          <p className="mt-1 leading-relaxed text-ink-2">{x.detail}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="ceo" aria-labelledby="ceo-title" className="scroll-mt-28">
      <div className="relative isolate grid h-[160px] place-items-center overflow-hidden md:h-[220px]">
        <Image src="/images/office-team.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[center_35%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/70" />
        <h2 id="ceo-title" className="text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] font-bold tracking-[-0.02em] !text-white [text-shadow:0_2px_16px_rgb(0_0_0/0.35)]">
          Leadership
        </h2>
      </div>

      <div className="bg-canvas py-12 md:py-16">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 md:px-10 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <Reveal>
            <p className="text-[1.25rem] font-bold text-ink">Message from our CEO</p>
            <p className="mt-4 text-[clamp(1.75rem,1.4rem+1vw,2.375rem)] font-bold leading-tight tracking-[-0.02em] text-ink">{ceo.name}</p>
            <p className="mt-2 text-ink-2">{ceo.role}</p>

            <div className="no-justify mt-8 space-y-8 text-[1.125rem] leading-[1.8] text-ink">
              {ceo.bio.map((t) => (
                <p key={t.slice(0, 40)}>{withBoldName(t)}</p>
              ))}
            </div>

          </Reveal>
          <Reveal delay={0.08}>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e6e3] shadow-[0_10px_30px_-18px_rgb(11_21_16/0.35)]">
              <Image src="/images/ceo-emmanuel-kenney.jpg" alt={`${ceo.name}, Founder and Chief Executive Officer of Flokefama`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
            </div>
          </Reveal>
        </div>

        {/* The rest runs on underneath at full width, so the message and the portrait stay side by side */}
        <div className="mx-auto mt-14 grid max-w-[1280px] gap-12 px-5 md:mt-20 md:grid-cols-2 md:px-10 lg:gap-16">
          <Reveal>
            <h3 className="text-[1.5rem] font-bold tracking-[-0.01em] text-ink">Education</h3>
            <div className="mt-5">{list(ceo.education)}</div>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="text-[1.5rem] font-bold tracking-[-0.01em] text-ink">Honours</h3>
            <div className="mt-5">{list(ceo.honours)}</div>
          </Reveal>
        </div>
        <Reveal className="mx-auto mt-14 max-w-[1280px] px-5 md:mt-20 md:px-10">
          <h3 className="text-[1.5rem] font-bold tracking-[-0.01em] text-ink">Philanthropy &amp; Purpose</h3>
          <p className="no-justify mt-5 max-w-4xl text-[1.125rem] leading-[1.8] text-ink">{ceo.purpose}</p>
          <figure className="mt-10">
            {/* Quote marks, drawn in outline */}
            <svg aria-hidden viewBox="0 0 56 46" className="h-12 w-14 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M14 2c-7 0-12 5-12 11.5S7 25 13 25c1.6 0 3-.3 4.2-.9C16.2 32 11.4 39 4 43l1.4 1.6C17.6 39 26 28 26 15 26 7.5 21 2 14 2Z" />
              <path d="M42 2c-7 0-12 5-12 11.5S35 25 41 25c1.6 0 3-.3 4.2-.9C44.2 32 39.4 39 32 43l1.4 1.6C45.6 39 54 28 54 15 54 7.5 49 2 42 2Z" />
            </svg>
            <blockquote className="mt-5 max-w-4xl text-[clamp(1.75rem,1.3rem+1.4vw,2.625rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink">{ceo.creed}</blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
