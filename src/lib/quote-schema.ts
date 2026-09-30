import { z } from 'zod';

export const departments = [
  { id: 'laboratory', label: 'Laboratory', icon: 'fi-rr-microscope' },
  { id: 'icu', label: 'ICU / Critical care', icon: 'fi-rr-heart-rate' },
  { id: 'theatre', label: 'Theatre', icon: 'fi-rr-stethoscope' },
  { id: 'maternity', label: 'Maternity', icon: 'fi-rr-baby' },
  { id: 'opd', label: 'OPD / Clinic', icon: 'fi-rr-hospital' },
  { id: 'cssd', label: 'Sterile services', icon: 'fi-rr-shield-check' },
] as const;

export const timelines = [
  { id: 'urgent', label: 'Urgent', detail: 'Within 2 weeks' },
  { id: 'quarter', label: 'This quarter', detail: '1–3 months' },
  { id: 'planning', label: 'Planning', detail: 'Budgeting / tender' },
] as const;

export const quoteSchema = z.object({
  intent: z.enum(['quote', 'demo']),
  department: z.enum(departments.map((d) => d.id) as [string, ...string[]], { message: 'Choose a department' }),
  equipment: z.array(z.string()).min(1, 'Select at least one item'),
  timeline: z.enum(timelines.map((t) => t.id) as [string, ...string[]], { message: 'Choose a timeline' }),
  name: z.string().trim().min(2, 'Enter your full name'),
  role: z.string().trim().max(80).optional().or(z.literal('')),
  facility: z.string().trim().min(2, 'Enter your facility'),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().or(z.literal('')),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
