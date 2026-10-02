"""Builds src/data/catalogue.ts from the current flokefama.com shop (WooCommerce Store API, read only)
and saves each product's main image as WebP in public/images/products/."""
import html, json, os, re, subprocess, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache')
os.makedirs(HERE, exist_ok=True)
IMG_DIR = f'{ROOT}/public/images/products'
os.makedirs(IMG_DIR, exist_ok=True)
products = json.load(open(f'{HERE}/products-1.json'))

# Original shop categories -> the site's five Shop categories
CATEGORY = {
    'Hematology Analyzers': 'in-vitro-diagnostics', 'Biochemistry Analyzers': 'in-vitro-diagnostics',
    'Auto Biochemistry Analyzers': 'in-vitro-diagnostics', 'Point-of-Care Testing (POCT)': 'in-vitro-diagnostics',
    'Patient Monitors': 'critical-care', 'Defibrillators': 'critical-care', 'Cardiology & Monitoring Equipment': 'critical-care',
    'ECG Machines': 'critical-care', 'Respiratory & Oxygen Therapy': 'critical-care', 'CPAP Machines': 'critical-care',
    'Oxygen Concentrators': 'critical-care', 'Nebulizer Masks': 'critical-care', 'Blood Pressure Monitors & Diagnostic Tools': 'critical-care',
    'Digital Microscopes': 'laboratory', 'Laboratory Accessories': 'laboratory', 'Centrifuges': 'laboratory',
    'Microbiology Equipment & Reagents': 'laboratory', 'Incubators': 'laboratory', 'Autoclave Machines': 'laboratory',
    'Hospital & Surgical Equipment': 'hospital-equipment', 'Suction Machines': 'hospital-equipment', 'Hospital Furniture': 'hospital-equipment',
    'Bedding': 'hospital-equipment', 'Storage Solutions': 'hospital-equipment', 'Patient Care & Hospital Beds': 'hospital-equipment',
    'Medical Disposables & Consumables': 'consumables', 'Chemistry Reagents': 'consumables',
}
# Products the original files under "Others", placed by what they are
OTHERS = {
    'ultrasound-machine-4pro': 'critical-care', 'dp-10-ultrasound': 'critical-care', 'hybrid-graphic-printer': 'critical-care',
    'fetal-doppler-small': 'critical-care', 'digital-thermometer': 'critical-care', 'handheld-pulse-oximeter': 'critical-care',
    'pulse-oximetre-tomorrow': 'critical-care', 'pulse-oximetervisamat': 'critical-care', 'pulse-oximeter-promed': 'critical-care',
    'pulse-oximeterhbo-smart': 'critical-care', 'pulse-oximeteraccare': 'critical-care',
    'omron-digital-scale': 'hospital-equipment', 'kinlee-scale-manual': 'hospital-equipment', 'baby-scale': 'hospital-equipment',
    'electronic-scale-with-height-and-fat': 'hospital-equipment', 'electronic-scale-with-height': 'hospital-equipment',
    'quantum-analyser-big': 'in-vitro-diagnostics', 'dcr-2000-biozek': 'in-vitro-diagnostics', 'ba-88a-bulb': 'consumables',
}
# "New Arrivals" on the current homepage
NEW = {'quantum-analyser-big', 'cpap-machine', 'microscope-olympus-cx23', 'electronic-scale-with-height-and-fat'}
FEATURED = {'semi-automated-chemistry-analysermindray'}

# Key features, verbatim from the Flokefama brochure (FlokeBroucher.pdf on flokefama.com), for products it lists
BROCHURE = {
    'auto-heamatology-analyzer-bc5150': ['CBC + 5-part', 'Compact and user-friendly', 'Cost-efficient', 'Accurate and efficient results', 'Smallest and lightest 5-part hematology analyzer', 'Low to moderate workload'],
    'haematology-analyzer-mindray-bc-20s': ['CBC + 3-DIFF, 19 parameters, and 3 histograms', '40 samples per hour', '8.4-inch TFT touch screen', 'Open vial sampling system', 'Stores 200,000 results with histograms', 'Original QC, calibrators, and reagents'],
    'haematology-analyzer-bc30s': ['CBC + 3-DIFF, 21 parameters, and 3 histograms', '70 samples per hour', '10.4-inch TFT touch screen', 'Open vial sampling system', 'Stores up to 500,000 results with histograms', 'Utilizes original QC, calibrators, and reagents'],
    'semi-automated-chemistry-analysermindray': ['BA-88A semi-auto chemistry analyzer', 'Features a 7.0” TFT touch-screen', 'Supports both flowcell and cuvette test modes', 'Can perform bi-chromatic tests for end point', 'Allows the use of USB'],
    'dcr-2000-biozek': ['Immunofluorescence quantitative analyzer: premium point of care solution', 'Advanced fluorescence immunoassay', 'Multiple quality control', 'Quantitative & qualitative test results', 'One-step test, result in about 3–15 min/test', '7-inch touch screen, Android system', 'RFID card calibration', 'LIS, HIS compatibility; USB 2 ports, LAN port, COM port'],
}

def text(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()

def paras(h):
    return [t for t in (text(p) for p in re.split(r'</p>|<br\s*/?>', h)) if t]

out = []
for p in products:
    slug = p['slug']
    name = html.unescape(p['name']).strip()
    types = [html.unescape(c['name']) for c in p['categories']]
    cat = OTHERS.get(slug) or next((CATEGORY[t] for t in types if t in CATEGORY), None)
    assert cat, (slug, types)
    brand = html.unescape(p['brands'][0]['name']) if p['brands'] else 'Flokefama'
    desc = paras(p['short_description']) + paras(p['description'])
    desc = list(dict.fromkeys(desc))  # the shop often repeats the same text as short and long description
    # Every photo the shop shows for the product: the first is the main image, the rest the gallery
    gallery = []
    for i, im in enumerate(p['images']):
        name_i = slug if i == 0 else f'{slug}-{i + 1}'
        dest = f'{IMG_DIR}/{name_i}.webp'
        if not os.path.exists(dest):
            raw = f'{HERE}/img-{name_i}'
            urllib.request.urlretrieve(im['src'], raw)
            subprocess.run(['node', '-e', f"require('{ROOT}/node_modules/sharp')('{raw}').flatten({{background:'#ffffff'}}).resize({{width:900,height:900,fit:'inside',withoutEnlargement:true}}).webp({{quality:80}}).toFile('{dest}')"], check=True)
        gallery.append(f'/images/products/{name_i}.webp')
    image = gallery[0] if gallery else None
    shown_types = [t for t in types if t != 'Others']
    out.append({
        'slug': slug, 'name': name, 'brand': brand, 'category': cat,
        'types': shown_types,
        'summary': desc[0] if desc else name,
        'description': desc,
        'image': image,
        'gallery': gallery[1:] or None,
        'highlights': BROCHURE.get(slug, []),
        'highlightsSource': 'brochure' if slug in BROCHURE else None,
        'specs': [], 'specsVerified': False, 'documents': [],
        'tags': sorted({*shown_types, brand}),
        'newArrival': slug in NEW, 'featured': slug in FEATURED,
        'source': p['permalink'].replace('https://flokefama.com', ''),
    })

out.sort(key=lambda x: (not x['featured'], x['name'].lower()))
lines = ['/* Generated from the current flokefama.com shop (92 products) by the catalogue import. Do not edit by hand:',
         ' * product names, categories, brands, descriptions and images are as published there; key features come from',
         ' * the Flokefama brochure. `source` is the product\'s path on the current site (used for redirects). */',
         "import type { Product } from '@/lib/types';", '',
         'export const catalogue: Product[] = ' + json.dumps([{k: v for k, v in o.items() if v not in (None, False) or k in ('specsVerified',)} for o in out], indent=2, ensure_ascii=False) + ';', '']
open(f'{ROOT}/src/data/catalogue.ts', 'w').write('\n'.join(lines))
print('products', len(out), {c: sum(1 for o in out if o['category'] == c) for c in sorted({o['category'] for o in out})})
