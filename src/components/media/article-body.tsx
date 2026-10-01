import Image from 'next/image';
import type { Block, Run } from '@/data/articles';

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        let node: React.ReactNode = r.t;
        if (r.i) node = <em>{node}</em>;
        if (r.b) node = <strong className="font-semibold text-ink">{node}</strong>;
        if (r.href) node = <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-4">{node}</a>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

/** Renders an article from flokefama.com: headings, paragraphs, lists, quotes and images, text verbatim. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[17px] font-light leading-[1.75] text-ink-2">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h':
            return <h2 key={i} className="!mt-10 text-2xl font-bold leading-snug tracking-[-0.02em] text-ink">{b.text}</h2>;
          case 'p':
            return <p key={i}><Runs runs={b.runs} /></p>;
          case 'quote':
            return (
              <blockquote key={i} className="border-l-4 border-brand-600 bg-brand-50 px-6 py-4 text-lg font-normal italic text-ink">
                <Runs runs={b.runs} />
              </blockquote>
            );
          case 'ul':
          case 'ol': {
            const List = b.type;
            return (
              <List key={i} className={b.type === 'ol' ? 'list-decimal space-y-2 pl-6' : 'list-disc space-y-2 pl-6 marker:text-brand-600'}>
                {b.items.map((item, j) => <li key={j}><Runs runs={item} /></li>)}
              </List>
            );
          }
          case 'img':
            return (
              <figure key={i} className="!my-8 overflow-hidden rounded-3xl border border-line bg-paper">
                <Image src={b.src} alt={b.alt} width={b.width} height={b.height} sizes="(min-width: 768px) 720px, 100vw" className="h-auto w-full" />
              </figure>
            );
        }
      })}
    </div>
  );
}
