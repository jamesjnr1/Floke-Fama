/**
 * The equipment categories the CEO's review asks to feature (point 1), shown on Products & Services and in the
 * home hero. Photos are generic (no models implied) until Flokefama's own product photos arrive, and need no credit
 * (Pexels). Mammography, dialysis and ventilators were taken out with their Wikimedia photos (CC BY-SA, which must be
 * credited on the page; the IT team's review, Nov 2026, asked for no photo credits): add them back with Flokefama's
 * own photos.
 */
export type EquipmentCategory = {
  slug: string;
  title: string;
  group: string;
  text: string;
  image: string;
  credit?: { author: string; license: string; source: string };
};

export const equipment: EquipmentCategory[] = [
  { slug: 'mri', title: 'MRI machines', group: 'Diagnostic imaging', text: 'Magnetic resonance imaging for detailed views of the brain, spine, joints and soft tissue, without radiation.', image: '/images/equipment/mri.webp' },
  { slug: 'ct', title: 'CT scanners', group: 'Diagnostic imaging', text: 'Fast cross-sectional imaging for trauma, stroke, cancer and emergency diagnosis.', image: '/images/equipment/ct.webp' },
  { slug: 'digital-xray', title: 'Digital X-ray systems', group: 'Diagnostic imaging', text: 'Digital radiography with instant, high-quality images for everyday diagnosis.', image: '/images/equipment/digital-xray.webp' },
  { slug: 'incubator', title: 'Incubators', group: 'Neonatal care', text: 'Controlled warmth and humidity to protect premature and newborn babies.', image: '/images/equipment/incubator.webp' },
  { slug: 'ultrasound', title: 'Ultrasound machines', group: 'Diagnostic imaging', text: 'Real-time imaging for obstetrics, cardiology and general medicine, from portable to premium systems.', image: '/images/equipment/ultrasound.webp' },
];
