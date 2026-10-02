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
  /** The original shop categories the product is listed under on flokefama.com (e.g. "Hematology Analyzers"). */
  types?: string[];
  /** Product description paragraphs, as published on flokefama.com. */
  description?: string[];
  highlights: string[];
  /** Where the highlights come from: 'brochure' = the Flokefama brochure. */
  highlightsSource?: 'brochure';
  specs: Spec[];
  /** Spec values in the seed are indicative until checked against the manufacturer datasheet. */
  specsVerified: boolean;
  compatibility?: CompatibilityRow[];
  documents: ProductDocument[];
  tags: string[];
  featured?: boolean;
  /** Shown in “New arrivals” on the Shop (as on the current flokefama.com homepage). */
  newArrival?: boolean;
  /** The product's path on the current flokefama.com (used to redirect old links). */
  source?: string;
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

export interface EventItem {
  id: string;
  title: string;
  /** Local date, YYYY-MM-DD: decides Upcoming or Past. */
  date: string;
  /** ISO start and end, for calendar invites and structured data. */
  start: string;
  end?: string;
  /** As shown to visitors, e.g. "3:00 pm – 7:00 pm". */
  time: string;
  venue: string;
  body: string;
  more?: string[];
  theme?: string;
  guests?: string;
  price?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  alt?: string;
}
