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
 * and his profile in plain paragraphs beside the portrait. Underneath:
 * Honours in a green box on the right, with Education and then Philanthropy & Purpose (opened by his creed) running
 * down beside it and on across the full width below it.
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
            <p className="inline-block bg-brand-600 px-4 py-2 text-[1.25rem] font-bold text-white">Message from our CEO</p>
            <p className="mt-5 text-[clamp(1.75rem,1.4rem+1vw,2.375rem)] font-bold leading-tight tracking-[-0.02em] text-ink">{ceo.name}</p>
            <p className="mt-2 font-mono text-ink-2">{ceo.role}</p>

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

        {/* Each heading sits in its own square box. The rest runs on underneath: the Honours box floats on the right, Education and then Philanthropy &
            Purpose run down the left beside it, and whatever runs past the box continues across the full width */}
        <div className="mx-auto mt-14 flow-root max-w-[1280px] px-5 md:mt-20 md:px-10">
          <Reveal delay={0.06} className="mb-10 bg-[linear-gradient(135deg,#0a5a33_0%,#06482a_60%,#043822_100%)] p-7 text-white md:float-right md:mb-6 md:ml-12 md:w-[calc(50%-1.5rem)] md:p-9 lg:ml-16 lg:w-[calc(50%-2rem)]">
            <h3 className="inline-block bg-white px-4 py-2 text-[1.375rem] font-bold tracking-[-0.01em] !text-brand-700">Honours</h3>
            <ul className="mt-5 space-y-5">
              {ceo.honours.map((x) => (
                <li key={x.title}>
                  <p className="text-lg font-semibold text-white">{x.title}</p>
                  <p className="mt-1 leading-relaxed text-white/75">{x.detail}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <h3 className="inline-block bg-brand-600 px-4 py-2 text-[1.375rem] font-bold tracking-[-0.01em] !text-white">Education</h3>
            <div className="mt-5">{list(ceo.education)}</div>
          </Reveal>
          <Reveal className="mt-10">
            <h3 className="inline-block bg-brand-600 px-4 py-2 text-[1.375rem] font-bold tracking-[-0.01em] !text-white">Philanthropy &amp; Purpose</h3>
            {/* His creed opens it */}
            <blockquote className="mt-5 text-[1.3125rem] font-semibold leading-[1.7] text-ink">“{ceo.creed}”</blockquote>
            <p className="no-justify mt-3 text-[1.25rem] leading-[1.8] text-ink">{ceo.purpose}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
