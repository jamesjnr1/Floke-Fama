import { z } from 'zod';

/** Who is asking for client portal access (shown as a choice on the Register tab). */
export const roles = [
  { id: 'lab', label: 'Laboratory manager / scientist' },
  { id: 'biomed', label: 'Biomedical engineer' },
  { id: 'procurement', label: 'Procurement / supply chain' },
  { id: 'clinical', label: 'Clinician / nurse' },
  { id: 'admin', label: 'Hospital administrator' },
  { id: 'other', label: 'Other' },
] as const;

/** Client portal registration. Accounts are verified by Flokefama before they go live, so this is an access request. */
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  facility: z.string().trim().min(2, 'Enter your hospital, lab or clinic').max(120),
  role: z.enum(['lab', 'biomed', 'procurement', 'clinical', 'admin', 'other']),
  email: z.string().trim().email('Enter a valid work email'),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  systems: z.string().trim().max(500).optional().or(z.literal('')),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().or(z.literal('')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
