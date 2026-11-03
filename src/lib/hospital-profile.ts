'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { appwrite } from '@/lib/appwrite';
import { getClientSession } from '@/lib/auth/server';
import { ensureFacility, findFacility, listFacilities, updateFacility } from '@/lib/facility-registry';
import { facilityTypes, gpsPattern, type HospitalProfile } from '@/lib/hospital-profile-fields';
import { normalisePhone, showPhone } from '@/lib/phone';
import { regions } from '@/lib/regions';

/**
 * The hospital's own profile (dashboard → Hospital profile): its kind, location and contact details. The hospital
 * keeps them up to date itself; the admin console only shows them. Saved in the hospital registry (its code's row).
 */

export interface ProfileFormState {
  errors?: Partial<Record<'type' | 'region' | 'town' | 'address' | 'gps' | 'phone' | 'contactName' | 'email' | 'form', string>>;
  values?: Record<string, string>;
  saved?: HospitalProfile;
}

const schema = z.object({
  type: z.enum(facilityTypes, { message: 'Choose the kind of facility' }),
  region: z.enum(regions, { message: 'Choose your region' }),
  town: z.string().trim().min(2, 'Enter your town or city').max(80),
  address: z.string().trim().min(5, 'Enter your address and how to find you').max(300),
  gps: z.string().trim().toUpperCase().max(20).refine((v) => !v || gpsPattern.test(v), 'Enter it like GA-123-4567, or leave it empty'),
  phone: z.string().trim().max(30).refine((v) => normalisePhone(v), 'Enter a phone number, e.g. 030 222 1234 or 024 123 4567'),
  contactName: z.string().trim().min(2, 'Enter the contact person’s name').max(120),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email('Enter a valid email, or leave it empty').max(160)]),
});

/** The signed-in hospital's profile (null when not signed in as a hospital, or in the demo). */
export async function myHospitalProfile(): Promise<HospitalProfile | null> {
  const s = await getClientSession();
  if (!s?.facility || s.demo || !appwrite) return null;
  const f = findFacility(await listFacilities().catch(() => []), s.facility);
  if (!f) return { name: s.facility };
  return { name: f.name, code: f.code, type: f.type, region: f.region, town: f.town, address: f.address, gps: f.gps, phone: f.phone ? showPhone(f.phone) : undefined, contactName: f.contactName, email: f.email, updatedAt: f.updatedAt };
}

export async function saveHospitalProfile(_prev: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const s = await getClientSession();
  if (!s?.facility) return { errors: { form: 'Your session has ended. Please sign in again.' } };
  const raw = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  if (s.demo) return { errors: { form: 'This is the demo: nothing is saved.' }, values: raw };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: ProfileFormState['errors'] = {};
    for (const i of parsed.error.issues) errors[i.path[0] as keyof NonNullable<ProfileFormState['errors']>] ??= i.message;
    return { errors, values: raw };
  }
  if (!appwrite) return { errors: { form: 'Not saved: the database isn’t connected.' }, values: raw };
  const d = parsed.data;
  try {
    const f = await ensureFacility(s.facility, {}, 'Registered on the website');
    if (!f) return { errors: { form: 'Not saved. Please try again.' }, values: raw };
    const details = { type: d.type, region: d.region, town: d.town, address: d.address, gps: d.gps, phone: showPhone(d.phone), contactName: d.contactName, email: d.email, updatedAt: new Date().toISOString() };
    await updateFacility(f.code, details);
    revalidatePath('/admin');
    return { saved: { name: f.name, code: f.code, ...details } };
  } catch (e) {
    console.error('hospital profile not saved', e);
    return { errors: { form: 'Not saved. Check your connection and try again.' }, values: raw };
  }
}
