/**
 * Which equipment Flokefama's engineers install and commission on site, and which is ready to use on delivery.
 * Used when a purchase becomes the hospital's equipment: installed systems wait for an installation job, the rest
 * go straight into service (BP monitors, diagnostic sets, oximeters, beds, wheelchairs, trolleys and the like).
 */
type ProductLike = { slug: string; category: string; types?: string[] };

/** Product types (the shop's own categories) that are always installed and commissioned by an engineer. */
const INSTALLED_TYPES = new Set([
  'Hematology Analyzers',
  'Biochemistry Analyzers',
  'Auto Biochemistry Analyzers',
  'Patient Monitors',
  'ECG Machines',
  'Autoclave Machines',
]);

/** Other systems that need site work, set-up or commissioning before first use. */
const INSTALLED_SLUGS = new Set([
  'dcr-2000-biozek',
  'quantum-analyser-big',
  'urine-analyzer-ua-66',
  'dp-10-ultrasound',
  'ultrasound-machine-4pro',
  'vital-monitor',
  'cardiotocography-machine-ctg',
  'micropalte-washer',
  'electrophoresis-machine',
  'dental-chair',
  'theatre-light-halogen',
  'electric-cautery-digital-diathermy-machine',
  'infant-radiant-warmer',
]);

export function needsInstallation(p: ProductLike) {
  return INSTALLED_SLUGS.has(p.slug) || (p.types ?? []).some((t) => INSTALLED_TYPES.has(t));
}
