/**
 * The CEO's five catalogue categories (Oct 2026): In-Vitro Diagnostics, Surgical & Theatre Equipment, Medical
 * Equipment, Medical Consumables and Rapid Diagnostics. Products from Sanity that still carry the earlier five
 * categories are placed in the new ones here, so the shop shows the new structure before the Studio is updated.
 */
export const CONSUMABLES = 'medical-consumables';

/** Earlier category → new category, for products that aren't listed individually below. */
const legacy: Record<string, string> = {
  'in-vitro-diagnostics': 'in-vitro-diagnostics',
  laboratory: 'in-vitro-diagnostics',
  'critical-care': 'medical-equipment',
  'hospital-equipment': 'medical-equipment',
  consumables: CONSUMABLES,
};

/** Products whose new category differs from what the earlier one implies. */
const bySlug: Record<string, string> = {
  'onetouch-select-plus-metre': 'rapid-diagnostics',
  'urine-analyzer-ua-66': 'rapid-diagnostics',
  'theatre-bed': 'surgical-theatre',
  'theatre-light-halogen': 'surgical-theatre',
  'electric-cautery-digital-diathermy-machine': 'surgical-theatre',
  'examiation-lamp': 'surgical-theatre',
  'suction-machine': 'surgical-theatre',
  'portable-suction-machine': 'surgical-theatre',
  'emergency-trolley': 'surgical-theatre',
  'patient-stretcher': 'surgical-theatre',
};
const autoclave = /^autoclave-machine/;

export const retiredCategorySlugs = ['laboratory', 'critical-care', 'hospital-equipment', 'consumables'];
export const newCategorySlugs = ['in-vitro-diagnostics', 'surgical-theatre', 'medical-equipment', CONSUMABLES, 'rapid-diagnostics'];

/** The category a product belongs to under the new structure. */
export function categoryOf(slug: string, category: string) {
  if (!(category in legacy)) return category; // already one of the new categories (or a new one from the Studio)
  if (bySlug[slug]) return bySlug[slug];
  if (autoclave.test(slug)) return 'surgical-theatre';
  return legacy[category];
}

/** Old ?category= links (bookmarks, search results) open the matching new category. */
export const legacyCategoryLink = (c: string) => legacy[c] ?? c;
