export type Icon = `fi-rr-${string}`;

export interface Category {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: Icon;
}

export interface Spec {
  label: string;
  value: string;
}

export interface ProductDocument {
  title: string;
  kind: 'datasheet' | 'brochure' | 'manual';
  /** Absent until the file is uploaded to the CMS; the UI offers "Request" instead. */
  url?: string;
}

export interface CompatibilityRow {
  item: string;
  status: 'validated' | 'supported' | 'consult';
  note?: string;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: string;
  summary: string;
  image?: string;
  highlights: string[];
  specs: Spec[];
  /** Spec values in the seed are indicative until checked against the manufacturer datasheet. */
  specsVerified: boolean;
  compatibility?: CompatibilityRow[];
  documents: ProductDocument[];
  tags: string[];
  featured?: boolean;
}

export interface Metric {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  caption?: string;
}

export interface Milestone {
  id: string;
  kicker: string;
  title: string;
  body: string;
  date?: string;
  image?: string;
  icon: Icon;
  href?: string;
}
