import { equipment } from '@/data/equipment';

/**
 * Solutions by department, from Flokefama's product presentation (support centre, Oct 2026). An item with `slug`
 * is a shop product (its photo and page come from the catalogue); the others use photos from the presentation.
 */
export type SolutionItem = { name: string; label: string; text?: string; slug?: string; image?: string; /** A full photo (shown filling its frame) rather than a product cut-out */ photo?: boolean; credit?: { author: string; license: string; source: string } };
export type Department = { id: string; name: string; title: string; text: string; groups: { title: string; points?: string[]; items: SolutionItem[] }[] };

const img = (n: string) => `/images/solutions/${n}.webp`;

export const departments: Department[] = [
  // The equipment categories the CEO's review asks to feature (point 1)
  {
    id: 'imaging-critical-care',
    name: 'Imaging & critical care',
    title: 'Imaging, renal, neonatal & critical care',
    text: 'MRI, CT, mammography, digital X-ray and ultrasound for diagnosis; dialysis, incubators and ventilators for treatment and life support.',
    groups: [
      {
        title: 'Imaging, renal, neonatal & critical care',
        items: equipment.map((e) => ({ name: e.title, label: e.group, text: e.text, image: e.image, photo: true, credit: e.credit })),
      },
    ],
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    title: 'Laboratory equipment',
    text: 'Haematology, clinical chemistry and immunoassay analysers from Mindray, from point-of-care to high-throughput reference labs.',
    groups: [
      {
        title: 'Haematology',
        items: [
          { name: 'BC-6200', label: 'Haematology analyser', text: 'High throughput and advanced cellular analysis.', image: img('bc-6200') },
          { name: 'BC-5150', label: '5-part auto analyser', text: 'Compact and efficient workflow.', slug: 'auto-heamatology-analyzer-bc5150' },
          { name: 'BC-700 / BC-720', label: 'Automated analyser', image: img('bc-700') },
          { name: 'BC-30s', label: '3-part differential', slug: 'haematology-analyzer-bc30s' },
          { name: 'BC-20s', label: 'Auto haematology', slug: 'haematology-analyzer-mindray-bc-20s' },
        ],
      },
      {
        title: 'Clinical chemistry',
        items: [
          { name: 'BS-430', label: 'Floor-standing analyser', text: 'High-capacity clinical chemistry system.', image: img('bs-430') },
          { name: 'BS-240', label: 'Benchtop chemistry', text: 'Versatile solution for mid-volume laboratories.', image: img('bs-240') },
          { name: 'BA-88A', label: 'Semi-automated analyser', slug: 'semi-automated-chemistry-analysermindray' },
        ],
      },
      {
        title: 'Immunoassay',
        items: [
          { name: 'Biozek DCR 2000 / 2000+', label: 'Point-of-care', slug: 'dcr-2000-biozek' },
          { name: 'Mindray CL-900i', label: 'Compact immunoassay', text: 'Up to 180 tests/hr, small footprint.', image: img('cl-900i') },
          { name: 'Mindray CL-1200i', label: 'Mid-capacity immunoassay', text: 'Up to 180 tests/hr, robust workload.', image: img('cl-1200i') },
          { name: 'Mindray CL-2000i', label: 'High-throughput system', text: 'Fully automated chemiluminescence for medium to large diagnostic centres.', image: img('cl-2000i') },
          { name: 'Mindray CL-2600i', label: 'Ultra high-capacity system', text: 'Flagship analyser for central reference and hospital labs.', image: img('cl-2600i') },
        ],
      },
    ],
  },
  {
    id: 'maternity',
    name: 'Women’s health & maternity',
    title: 'Women’s health, labour & neonatal care',
    text: 'Ultrasound for gynaecology and obstetrics, labour room beds and tables, and equipment for newborns.',
    groups: [
      {
        title: 'Ultrasound diagnostics',
        points: ['Gynaecology: imaging for complete women’s wellness.', 'Obstetrics: precise fetal monitoring and developmental assessment.', 'Urogynaecology: pelvic floor diagnosis and therapeutic guidance.'],
        items: [{ name: 'Nuewa R9 Platinum', label: 'Women’s health ultrasound', image: img('nuewa-r9') }],
      },
      {
        title: 'Labour room',
        items: [
          { name: 'Delivery bed', label: 'Obstetrics', image: img('delivery-bed') },
          { name: 'Electric LDR bed', label: 'Labour, delivery & recovery', image: img('electric-ldr-bed') },
          { name: 'Obstetric table', label: 'Obstetrics', image: img('obstetric-table') },
          { name: 'Telescopic bed', label: 'Obstetrics', image: img('telescopic-bed') },
        ],
      },
      {
        title: 'Newborn & mother',
        items: [
          { name: 'Infant incubator', label: 'Neonatal care', image: img('infant-incubator') },
          { name: 'Infant radiant warmer', label: 'Neonatal care', slug: 'infant-radiant-warmer' },
          { name: 'Fetal monitor (CTG)', label: 'Fetal monitoring', slug: 'cardiotocography-machine-ctg' },
          { name: 'Fetal Doppler', label: 'Fetal monitoring', slug: 'fetal-doppler-small' },
          { name: 'Baby scale', label: 'Diagnostics', slug: 'baby-scale' },
          { name: 'Pulse oximeter', label: 'Diagnostics', slug: 'handheld-pulse-oximeter' },
        ],
      },
    ],
  },
  {
    id: 'opd-ward',
    name: 'OPD & ward',
    title: 'Outpatient and ward care',
    text: 'Diagnostic instruments for outpatient examination, patient monitoring, ward furniture and mobility.',
    groups: [
      {
        title: 'Clinical & patient care',
        items: [
          { name: 'Omron M7', label: 'Digital blood pressure monitor', slug: 'omron-m7' },
          { name: 'Vital signs monitor', label: 'Multi-parameter ECG, SpO2, NIBP', slug: 'vital-monitor' },
          { name: 'Hospital ward bed', label: 'Full electric & hydraulic beds', image: img('ward-bed') },
          { name: 'Examination bed', label: 'Outpatient', slug: 'examination-bed' },
          { name: 'Ward screen', label: 'Foldable privacy screens', slug: 'wardscreen-4fold' },
          { name: 'Wheelchair', label: 'Motorised & manual', slug: 'wheel-chair-normal' },
        ],
      },
    ],
  },
  {
    id: 'orthopaedics',
    name: 'Orthopaedics',
    title: 'Orthopaedic surgical & reconstructive solutions',
    text: 'Implants and instrumentation for joint replacement, fracture fixation and spinal surgery.',
    groups: [
      {
        title: 'Orthopaedics',
        items: [
          { name: 'Arthroplasty', label: 'Joint reconstruction', text: 'Hip and knee joint replacement and reconstruction.', image: img('arthroplasty') },
          { name: 'Trauma', label: 'Fracture fixation', text: 'Bone plates, intramedullary nails and external fixators.', image: img('trauma') },
          { name: 'Spine', label: 'Spinal surgery', text: 'Anterior cervical and general spine system instrumentation.', image: img('spine') },
        ],
      },
    ],
  },
  {
    id: 'microbiology',
    name: 'Microbiology setup',
    title: 'Microbiology & laboratory setup',
    text: 'A one-stop setup for microbiology labs: instruments, specimen collection and disposables.',
    groups: [
      {
        title: 'Instruments, collection & disposables',
        items: [
          { name: 'Olympus CX23 microscope', label: 'Laboratory instruments', slug: 'microscope-olympus-cx23' },
          { name: 'Centrifuge', label: 'Laboratory instruments', slug: 'centrifuge-2' },
          { name: 'Lab incubator', label: 'Culture', slug: 'lab-incubator' },
          { name: 'Electrophoresis machine', label: 'Testing', slug: 'electrophoresis-machine' },
          { name: 'Vacuum blood tubes', label: 'Specimen collection', image: img('vacuum-blood-tubes') },
          { name: 'Syringes', label: 'Disposables', image: img('syringes') },
          { name: 'Nitrile gloves', label: 'PPE', image: img('nitrile-gloves') },
        ],
      },
    ],
  },
];

/** Complete laboratory packages by daily workload (haematology, biochemistry, immunoassay). */
export const labPackages = [
  { tier: 'Entry', models: ['BC-20s / BC-5150', 'BA-88A / BS-230', 'Biozek DCR 2000'], samples: ['± 30', '± 20', '± 5'] },
  { tier: 'Mid-range', models: ['BC-760', 'BS-240', 'CL-900i'], samples: ['± 60', '± 35', '± 10'] },
  { tier: 'High-end', models: ['BC-6200 + RET', 'BS-430', 'CL-1200i'], samples: ['± 80', '± 50', '± 20'] },
];
export const labDisciplines = [
  { name: 'Haematology', tests: 'Full blood count' },
  { name: 'Biochemistry', tests: 'LFTs, BUE, lipids, cardiac, iron studies' },
  { name: 'Immunoassay', tests: 'Fertility, thyroid, tumour markers, infectious diseases' },
];
