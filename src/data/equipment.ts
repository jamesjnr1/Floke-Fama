/**
 * The equipment categories the CEO's review asks to feature (point 1), shown on Products & Services and in the
 * home hero. Photos are generic (no models implied) until Flokefama's own product photos arrive. Pexels photos
 * need no credit; Wikimedia Commons photos are CC BY-SA and are credited on the page (`credit`).
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
  {
    slug: 'mammography',
    title: 'Mammography systems',
    group: 'Women’s health',
    text: 'Digital breast imaging for screening and the early detection of breast cancer.',
    image: '/images/equipment/mammography.webp',
    credit: { author: 'Aboutmovies', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Genius_3D_mammogram_machine.jpg' },
  },
  { slug: 'digital-xray', title: 'Digital X-ray systems', group: 'Diagnostic imaging', text: 'Digital radiography with instant, high-quality images for everyday diagnosis.', image: '/images/equipment/digital-xray.webp' },
  {
    slug: 'dialysis',
    title: 'Dialysis machines',
    group: 'Renal care',
    text: 'Haemodialysis systems for safe, reliable treatment of patients with kidney failure.',
    image: '/images/equipment/dialysis.webp',
    credit: { author: 'Vitaly Pospelov', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Hemodialysis_machine_INNOVA.jpg' },
  },
  { slug: 'incubator', title: 'Incubators', group: 'Neonatal care', text: 'Controlled warmth and humidity to protect premature and newborn babies.', image: '/images/equipment/incubator.webp' },
  {
    slug: 'ventilator',
    title: 'Ventilators',
    group: 'Critical care',
    text: 'Breathing support for intensive care, operating theatres and emergency transport.',
    image: '/images/equipment/ventilator.webp',
    credit: { author: 'BreathDriver', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Servo_I_Ventilator.jpg' },
  },
  { slug: 'ultrasound', title: 'Ultrasound machines', group: 'Diagnostic imaging', text: 'Real-time imaging for obstetrics, cardiology and general medicine, from portable to premium systems.', image: '/images/equipment/ultrasound.webp' },
];
