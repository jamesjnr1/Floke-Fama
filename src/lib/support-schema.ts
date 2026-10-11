import { z } from 'zod';

/** What a technical support request is for (the services on the Support page). */
export const requestTypes = [
  { id: 'fault', label: 'Report a fault' },
  { id: 'maintenance', label: 'Book maintenance' },
  { id: 'installation', label: 'Installation' },
  { id: 'assistance', label: 'Other assistance' },
] as const;

export const supportSchema = z.object({
  type: z.enum(['fault', 'maintenance', 'installation', 'assistance']),
  name: z.string().trim().min(2, 'Enter your name').max(100),
  facility: z.string().trim().min(2, 'Enter your hospital or laboratory').max(160),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  equipment: z.string().trim().min(2, 'Which equipment is it?').max(160),
  message: z.string().trim().min(5, 'Describe the problem or request').max(2000),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().or(z.literal('')),
});

export type SupportInput = z.infer<typeof supportSchema>;

/** The request as one plain-text message (for the CRM, email or WhatsApp). */
export function supportSummary(d: SupportInput) {
  return [
    requestTypes.find((t) => t.id === d.type)?.label,
    `Facility: ${d.facility}`,
    `Equipment: ${d.equipment}`,
    '',
    d.message,
  ].join('\n');
}
