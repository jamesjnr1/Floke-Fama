import { PageHero } from '@/components/layout/page-hero';
import { getSite } from '@/lib/site';
import type { PageKey } from '@/lib/site-content';

/**
 * A page header from the editable site content (Sanity → Site content → Page headers): heading, the words shown
 * in italic, the intro line and the photo. `vars` fills placeholders such as {count} in the intro line.
 */
export async function SitePageHero({ page, flip, kicker, vars = {} }: { page: PageKey; flip?: boolean; kicker?: string; vars?: Record<string, string | number> }) {
  const h = (await getSite()).pageHeaders[page];
  const lead = h.lead.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
  return (
    <PageHero
      image={h.image}
      position={h.position}
      veil={h.veil}
      flip={flip}
      kicker={kicker}
      title={
        <span className={page === 'about' ? 'inline-block rounded-lg bg-[#E5252A] px-5 py-3 text-white shadow-lg [&_em]:font-sans [&_em]:font-bold [&_em]:italic' : ''}>
          {page === 'about' ? (
            <em>{h.emphasisFirst ? `${h.highlight} ${h.title}` : `${h.title} ${h.highlight}`}</em>
          ) : h.emphasisFirst ? (
            <>
              {h.highlight && <em>{h.highlight}</em>} {h.title}
            </>
          ) : (
            <>
              {h.title} {h.highlight && <em>{h.highlight}</em>}
            </>
          )}
        </span>
      }
      lead={lead}
    />
  );
}
