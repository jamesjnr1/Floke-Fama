import Image from 'next/image';
import type { Block, Run } from '@/data/articles';

/** Anchor id for an article heading (used by the "In this article" list). */
export const headingId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        let node: React.ReactNode = r.t;
        if (r.i) node = <em>{node}</em>;
        if (r.b) node = <strong className="font-semibold text-ink">{node}</strong>;
        if (r.href) node = <a href={r.href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-4 hover:decoration-brand-600">{node}</a>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

/** Renders an article from flokefama.com (text verbatim) with editorial typography. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  const firstP = blocks.findIndex((b) => b.type === 'p');
  return (
    <div className="text-[1.0625rem] leading-[1.85] text-ink-2 md:text-lg [&>*+*]:mt-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return (
              <h2 key={i} id={headingId(b.text)} className="!mt-14 scroll-mt-28 text-[1.65rem] font-bold leading-snug tracking-[-0.02em] text-ink">
                {b.text}
              </h2>
            );
          case 'p':
            return i === firstP ? (
              <p key={i} className="text-xl font-normal leading-relaxed text-ink md:text-[1.375rem]"><Runs runs={b.runs} /></p>
            ) : (
              <p key={i}><Runs runs={b.runs} /></p>
            );
          case 'quote':
            return (
              <blockquote key={i} className="!my-10 rounded-3xl bg-midnight px-8 py-7 text-white">
                <span aria-hidden className="block text-5xl font-bold leading-none text-brand-400">“</span>
                <p className="-mt-2 text-xl font-normal leading-relaxed [&_strong]:text-white"><Runs runs={b.runs} /></p>
              </blockquote>
            );
          case 'ul':
            return (
              <ul key={i} className="space-y-3">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] size-2 shrink-0 rounded-full bg-brand-500" />
                    <span><Runs runs={item} /></span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="space-y-3">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-xs font-medium text-brand-700">{j + 1}</span>
                    <span><Runs runs={item} /></span>
                  </li>
                ))}
              </ol>
            );
          case 'img':
            return (
              <figure key={i} className="!my-10 overflow-hidden rounded-lg last:!mb-0 border border-line bg-paper">
                <Image src={b.src} alt={b.alt} width={b.width} height={b.height} sizes="(min-width: 1024px) 800px, 100vw" className="h-auto w-full" />
                {b.alt && <figcaption className="border-t border-line px-5 py-3 text-sm text-ink-3">{b.alt}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
