/**
 * The products the shop opens with (all equipment, no search), in this order; the first is shown large. Chosen for
 * their photos, with Mindray the only brand on show (the CEO's review). The rest follow: the Studio's featured
 * products, then A to Z.
 */
export const shopLead = [
  'dp-10-ultrasound',
  'auto-heamatology-analyzer-bc5150',
  'haematology-analyzer-bc30s',
  'theatre-light-halogen',
  'auto-haematology-analyzer-bc3000plus',
  'infant-radiant-warmer',
  'cpap-machine',
  'ecg-12-channel',
];

/** Where a product stands in the lead (those not in it after, in their usual order). */
export const leadRank = (slug: string) => {
  const i = shopLead.indexOf(slug);
  return i === -1 ? shopLead.length : i;
};
