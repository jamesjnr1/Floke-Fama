import { z } from 'zod';

/** Enquiry topics, routed to the matching Flokefama inbox (as listed on the current Contact page). */
export const topics = [
  { id: 'sales', label: 'Sales & quotes', inbox: 'sales@flokefama.com' },
  { id: 'support', label: 'Service & support', inbox: 'support@flokefama.com' },
  { id: 'general', label: 'General enquiry', inbox: 'info@flokefama.com' },
] as const;

export const contactSchema = z.object({
  topic: z.enum(['sales', 'support', 'general']),
  name: z.string().trim().min(2, 'Enter your name').max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')),
  message: z.string().trim().min(5, 'Tell us a little more').max(2000),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
