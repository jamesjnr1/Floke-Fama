/**
 * Product names in one house style, for launch. The names came across from the old shop as typed there (some in
 * capitals, some misspelt, "Analyser" and "Analyzer" mixed). The house style: British spelling (Analyser,
 * Haematology, Nebuliser), the model first and then what the product is ("BC-5150 Auto Haematology Analyser"), and
 * no brand in the name (it shows above the name on every card).
 *
 * Each correction applies only while the Studio still has the old name, so a name changed in the Studio always
 * wins. The same goes for brands. The old name is also replaced where it appears in the product's description.
 */
const names: Record<string, [from: string, to: string]> = {
  'a-n-d-bp-monitor': ['A.N.D BP MONITOR', 'Digital Blood Pressure Monitor'],
  'air-mattress': ['AIR MATTRESS', 'Air Mattress'],
  'aneriod-sphyg': ['ANERIOD SPHYG', 'Aneroid Sphygmomanometer'],
  'auto-haematology-analyzer-bc3000plus': ['AUTO HAEMATOLOGY ANALYZER BC3000plus', 'BC-3000 Plus Auto Haematology Analyser'],
  'auto-heamatology-analyzer-bc5150': ['Auto Heamatology Analyzer BC5150', 'BC-5150 Auto Haematology Analyser'],
  'autoclave-machine-100l': ['Autoclave Machine 100L', 'Autoclave, 100 L'],
  'autoclave-machine-24l': ['Autoclave Machine 24L', 'Autoclave, 24 L'],
  'autoclave-machine-35l': ['Autoclave Machine 35L', 'Autoclave, 35 L'],
  'autoclave-machine-50l': ['Autoclave Machine 50L', 'Autoclave, 50 L'],
  'autoclave-machine-75l': ['Autoclave Machine 75L', 'Autoclave, 75 L'],
  'b-pp-monitor-shs': ['B.PP MONITOR- SHS', 'Blood Pressure Monitor'],
  'ba-88a-bulb': ['BA 88A BULB', 'BA-88A Replacement Lamp'],
  'baby-scale': ['BABY SCALE', 'Baby Scale'],
  'biological-microscope': ['BIOLOGICAL MICROSCOPE', 'Biological Microscope'],
  'bp-machine-with-stand': ['BP Machine with Stand', 'Blood Pressure Machine with Stand'],
  'baby-basinet': ['Baby Basinet', 'Baby Bassinet'],
  'centrifuge-2': ['CENTRIFUGE 2', 'Laboratory Centrifuge'],
  'chemistry-cuvette-bs-230': ['CHEMISTRY CUVETTE Bs-230', 'BS-230 Chemistry Cuvettes'],
  'cpap-machine': ['CPAP MACHINE', 'CPAP Machine'],
  'cardiotocography-machine-ctg': ['Cardiotocography Machine (CTG)', 'Cardiotocography (CTG) Machine'],
  'children-bed': ['Children Bed', 'Children’s Bed'],
  'dcr-2000-biozek': ['DCR – 2000 (Biozek)', 'DCR-2000'],
  'defibrillator-a-ed': ['DEFIBRILLATOR (A.ED)', 'Automated External Defibrillator (AED)'],
  'diagnostic-set': ['DIAGNOSTIC SET', 'Diagnostic Set'],
  'digital-thermometer': ['DIGITAL THERMOMETER', 'Digital Thermometer'],
  'dp-10-ultrasound': ['DP 10 ULTRASOUND', 'DP-10 Ultrasound System'],
  'defribillator': ['Defribillator', 'Defibrillator'],
  'ecg-12-channel': ['ECG 12 CHANNEL', '12-Channel ECG Machine'],
  'electronic-scale-with-height': ['ELECTRONIC SCALE WITH HEIGHT', 'Electronic Scale with Height Measure'],
  'electronic-scale-with-height-and-fat': ['ELECTRONIC SCALE WITH HEIGHT AND FAT', 'Electronic Scale with Height and Body Fat'],
  'emergency-trolley': ['EMERGENCY TROLLEY', 'Emergency Trolley'],
  'examination-bed': ['EXAMINATION BED', 'Examination Bed'],
  'electric-cautery-digital-diathermy-machine': ['Electric Cautery Digital (Diathermy Machine)', 'Digital Electrocautery (Diathermy) Machine'],
  'examiation-lamp': ['Examiation Lamp', 'Examination Lamp'],
  'fetal-doppler-small': ['FETAL DOPPLER SMALL', 'Pocket Fetal Doppler'],
  'first-aid-bag-red': ['FIRST AID BAG (Red)', 'First Aid Bag (Red)'],
  'haematology-analyzer-mindray-bc-20s': ['HAEMATOLOGY ANALYZER (Mindray BC 20s)', 'BC-20s Haematology Analyser'],
  'haematology-analyzer-bc30s': ['HAEMATOLOGY ANALYZER BC30s', 'BC-30s Haematology Analyser'],
  'hybrid-graphic-printer': ['HYBRID GRAPHIC PRINTER', 'Hybrid Graphic Printer'],
  'kinlee-scale-manual': ['KINLEE SCALE MANUAL', 'Mechanical Scale'],
  'lab-incubator': ['Lab Incubator', 'Laboratory Incubator'],
  'lab-incubator-30-l': ['Lab Incubator 30 L', 'Laboratory Incubator, 30 L'],
  'medicine-trolley-2-step': ['MEDICINE  TROLLEY -2 STEP', 'Medicine Trolley, 2-Step'],
  'medicine-trolley-3-step': ['MEDICINE TROLLEY – 3 STEP', 'Medicine Trolley, 3-Step'],
  'micropalte-washer': ['MICROPALTE WASHER', 'Microplate Washer'],
  'microscope-screen': ['MICROSCOPE (SCREEN)', 'Microscope with Screen'],
  'multifunctional-bed-2-crank': ['MULTIFUNCTIONAL BED -2 CRANK', 'Multifunctional Bed, 2-Crank'],
  'microscope-olympus-cx23': ['Microscope Olympus – CX23', 'CX23 Microscope'],
  'microscope-olympus-cx-33': ['Microscope Olympus-CX 33', 'CX33 Microscope'],
  'multifuctional-bed-1-crank': ['Multifuctional Bed – 1 Crank', 'Multifunctional Bed, 1-Crank'],
  'nebulizer-machine-adult': ['Nebulizer Machine Adult', 'Nebuliser Machine (Adult)'],
  'omron-m2': ['OMRON M2', 'M2 Blood Pressure Monitor'],
  'omron-m7': ['OMRON M7', 'M7 Blood Pressure Monitor'],
  'omron-m3': ['Omron M3', 'M3 Blood Pressure Monitor'],
  'omron-digital-scale': ['Omron Digital Scale', 'Digital Scale'],
  'omron-nebulizer': ['Omron Nebulizer', 'Nebuliser'],
  'onetouch-select-plus-metre': ['ONETOUCH SELECT PLUS METRE', 'Select Plus Blood Glucose Meter'],
  'oxygen-concentrator-10l': ['OXYGEN CONCENTRATOR 10L', 'Oxygen Concentrator, 10 L'],
  'oxygen-cylinder-10l': ['Oxygen Cylinder 10L', 'Oxygen Cylinder, 10 L'],
  'oxygen-cylinder-40l': ['Oxygen Cylinder 40L', 'Oxygen Cylinder, 40 L'],
  'patient-monitor-normal': ['PATIENT MONITOR-Normal', 'Patient Monitor (Standard)'],
  'ph-meter': ['PH METER', 'pH Meter'],
  'pulse-oximetre-tomorrow': ['PULSE OXIMETRE- (TOMORROW)', 'Pulse Oximeter'],
  'patient-monitor-comen': ['Patient Monitor- Comen', 'Patient Monitor'],
  'pulse-oximeter-promed': ['Pulse Oximeter (Promed)', 'Pulse Oximeter'],
  'pulse-oximeteraccare': ['Pulse Oximeter(Accare)', 'Pulse Oximeter'],
  'pulse-oximeterhbo-smart': ['Pulse Oximeter(HBO-Smart)', 'Pulse Oximeter'],
  'quantum-analyser-big': ['QUANTUM ANALYSER (BIG)', 'Quantum Analyser (Large)'],
  'semi-automated-chemistry-analysermindray': ['SEMI AUTOMATED CHEMISTRY ANALYSER(MINDRAY)', 'BA-88A Semi-Automated Chemistry Analyser'],
  'suction-machine': ['SUCTION MACHINE', 'Suction Machine'],
  'theatre-bed': ['THEATRE BED', 'Theatre Bed'],
  'theatre-light-halogen': ['Theatre Light Halogen', 'Halogen Theatre Light'],
  'ultrasound-machine-4pro': ['ULTRASOUND MACHINE 4PRO', '4Pro Ultrasound Machine'],
  'ultra-violet-uv-light': ['Ultra Violet (UV) Light', 'Ultraviolet (UV) Light'],
  'urine-analyzer-ua-66': ['Urine Analyzer UA-66', 'UA-66 Urine Analyser'],
  'vital-monitor': ['VITAL MONITOR', 'Vital Signs Monitor'],
  'wardscreen-4fold': ['WARDSCREEN – 4FOLD', 'Ward Screen, 4-Fold'],
  'wardscreen-5fold': ['WARDSCREEN – 5FOLD', 'Ward Screen, 5-Fold'],
  'water-bath': ['WATER BATH', 'Water Bath'],
  'wheel-chair-comode': ['WHEEL CHAIR COMODE', 'Commode Wheelchair'],
  'wheel-chair-normal': ['WHEEL CHAIR – NORMAL', 'Wheelchair (Standard)'],
  'zima-frame-with-wheels': ['ZIMA FRAME WITH WHEELS', 'Zimmer Frame with Wheels'],
};

/** Brands as the makers write them (the old shop had most in capitals). */
const brands: Record<string, string> = {
  KINLEE: 'Kinlee', JUMPER: 'Jumper', YUWELL: 'Yuwell', BIOCARE: 'Biocare', SONY: 'Sony', TOMORROW: 'Tomorrow', OLYMPUS: 'Olympus',
  OMRON: 'Omron', COMEN: 'Comen', ONETOUCH: 'OneTouch', BIOZEK: 'Biozek', VISOMAT: 'Visomat', PROMED: 'Promed', ACCARE: 'Accare',
  'HBO-SMART': 'HBO-Smart', 'S.H.S': 'SHS', 'A.N.D': 'A&D',
};

type Named = { slug: string; name: string; brand: string; summary?: string; description?: string[] };

/** The product with its name and brand in the house style (unless the Studio has changed them since). */
export function tidyProduct<T extends Named>(p: T): T {
  const fix = names[p.slug];
  const old = fix && fix[0] === p.name ? fix[0] : null;
  const name = old ? fix[1] : p.name;
  const brand = brands[p.brand] ?? p.brand;
  if (!old && brand === p.brand) return p;
  const swap = (t: string) => (old ? t.split(old).join(name) : t);
  return { ...p, name, brand, summary: p.summary === undefined ? p.summary : swap(p.summary), description: p.description?.map(swap) };
}

/** A shop listing ("Hematology Analyzers") in the house style, for showing it; the stored value stays as it is. */
export const listingLabel = (t: string) => t.replace(/\bAnalyzers?\b/g, (w) => w.replace('yz', 'ys')).replace(/\bHematology\b/g, 'Haematology').replace(/\bHeamatology\b/g, 'Haematology');
