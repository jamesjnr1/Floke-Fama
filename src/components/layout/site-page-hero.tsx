import { PageHero } from '@/components/layout/page-hero';
import { getSite } from '@/lib/site';
import type { PageKey } from '@/lib/site-content';

/**
 * A page header from the editable site content (Sanity → Site content → Page headers): heading, the words shown
 * in italic, the intro line and the photo. `vars` fills placeholders such as {count} in the intro line.
 */
export async function SitePageHero({ page, flip, vars = {} }: { page: PageKey; flip?: boolean; vars?: Record<string, string | number> }) {
  const h = (await getSite()).pageHeaders[page];
  const lead = h.lead.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
  return (
    <PageHero
      image={h.image}
      position={h.position}
      flip={flip}
      title={
        <>
          {h.title} {h.highlight && <em>{h.highlight}</em>}
        </>
      }
      lead={lead}
    />
  );
}
