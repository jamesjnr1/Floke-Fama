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
        <>
          {h.emphasisFirst ? (
            <>
              {/* The motto: the whole line in white italic on a red block (About: "Saving Lives since 2008") */}
              <em className="inline-block rounded-[0.14em] bg-[#d23b36] px-[0.3em] pb-[0.12em] pt-[0.04em] text-white [text-shadow:none] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)]">
                {h.highlight ? `${h.highlight} ${h.title}` : h.title}
              </em>
            </>
          ) : (
            <>
              {h.title} {h.highlight && <em>{h.highlight}</em>}
            </>
          )}
        </>
      }
      lead={lead}
    />
  );
}
