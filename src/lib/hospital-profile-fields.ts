/** What a hospital keeps in its profile (dashboard → Hospital profile), shared by the form and the server. */
export const facilityTypes = ['Hospital', 'Teaching hospital', 'Polyclinic', 'Clinic', 'Health centre', 'Laboratory', 'Diagnostic centre', 'Maternity home', 'Pharmacy', 'Other'] as const;

export interface HospitalProfile {
  name: string;
  code?: string;
  type?: string;
  region?: string;
  town?: string;
  address?: string;
  gps?: string;
  phone?: string;
  contactName?: string;
  email?: string;
  updatedAt?: string;
}

/** The details a profile needs before it counts as complete (the dashboard asks for them until then). */
export const profileComplete = (p: HospitalProfile | null | undefined) => Boolean(p?.type && p.region && p.town && p.address && p.phone && p.contactName);

/** A GhanaPost digital address: two letters, then two groups of digits (e.g. GA-123-4567). */
export const gpsPattern = /^[A-Z]{2}-\d{3,4}-\d{3,5}$/;
