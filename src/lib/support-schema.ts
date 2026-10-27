import { z } from 'zod';

/** What a technical support request is for (the tabs of the Support page's form). */
export const requestTypes = [
  { id: 'fault', label: 'Report a fault' },
  { id: 'maintenance', label: 'Book maintenance' },
  { id: 'installation', label: 'Installation' },
  { id: 'assistance', label: 'Other assistance' },
] as const;

/** Report a fault: is the equipment still running? */
export const workingStates = [
  { id: 'down', label: 'Not working at all' },
  { id: 'partly', label: 'Working, with problems' },
] as const;

/** Other assistance: what it is about. */
export const assistanceTopics = [
  { id: 'demo', label: 'Product demonstration' },
  { id: 'training', label: 'Staff training' },
  { id: 'parts', label: 'Parts & consumables' },
  { id: 'documents', label: 'Manuals & certificates' },
  { id: 'other', label: 'Something else' },
] as const;

const optional = (max: number) => z.string().trim().max(max).optional().default('');
const date = z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Choose a date').optional().default('');

/**
 * Each tab asks for what that request needs:
 * - Report a fault: the equipment, its serial number (optional), whether it still runs, and what is happening.
 * - Book maintenance: the equipment, how many units, when it was last serviced and a preferred date (optional).
 * - Installation: the equipment, the order or invoice number, where it goes and a preferred date (optional).
 * - Other assistance: what it is about, the equipment (optional) and the details.
 * Every request also has the hospital, the caller's name and phone.
 */
export const supportSchema = z
  .object({
    type: z.enum(['fault', 'maintenance', 'installation', 'assistance']),
    name: z.string().trim().min(2, 'Enter your name').max(100),
    facility: z.string().trim().min(2, 'Enter your hospital or laboratory').max(160),
    phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a valid phone number'),
    equipment: optional(160),
    message: optional(2000),
    serial: optional(60),
    working: z.enum(['down', 'partly', '']).optional().default(''),
    units: z.string().trim().regex(/^(\d{1,3})?$/, 'Enter a number').optional().default(''),
    lastService: date,
    preferredDate: date,
    order: optional(40),
    location: optional(80),
    topic: z.enum(['demo', 'training', 'parts', 'documents', 'other', '']).optional().default(''),
    /** Honeypot: real users never fill this. */
    website: z.string().max(0).optional().or(z.literal('')),
  })
  .superRefine((d, ctx) => {
    const need = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (d.type !== 'assistance' && d.equipment.length < 2) need('equipment', 'Which equipment is it?');
    if (d.type === 'fault') {
      if (!d.working) need('working', 'Is it still working?');
      if (d.message.length < 5) need('message', 'Describe the fault');
    }
    if (d.type === 'installation' && d.location.length < 2) need('location', 'Where will it be installed?');
    if (d.type === 'assistance') {
      if (!d.topic) need('topic', 'Choose what you need');
      if (d.message.length < 5) need('message', 'Tell us what you need');
    }
  });

export type SupportInput = z.infer<typeof supportSchema>;

const fmtDate = (v: string) => (v ? new Date(`${v}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** The request's own details (not the caller's), as label and value, in the order they were asked; empty ones left out. */
export function supportDetails(d: Partial<SupportInput>): [string, string][] {
  const rows: [string, string | undefined][] = {
    fault: [
      ['Equipment', d.equipment],
      ['Serial number', d.serial],
      ['Status', workingStates.find((w) => w.id === d.working)?.label],
      ['What is happening', d.message],
    ],
    maintenance: [
      ['Equipment', d.equipment],
      ['Units', d.units],
      ['Last serviced', fmtDate(d.lastService ?? '')],
      ['Preferred date', fmtDate(d.preferredDate ?? '')],
      ['Notes', d.message],
    ],
    installation: [
      ['Equipment', d.equipment],
      ['Order or invoice', d.order],
      ['Install at', d.location],
      ['Preferred date', fmtDate(d.preferredDate ?? '')],
      ['Notes', d.message],
    ],
    assistance: [
      ['Help with', assistanceTopics.find((t) => t.id === d.topic)?.label],
      ['Equipment', d.equipment],
      ['Details', d.message],
    ],
  }[d.type ?? 'fault'] as [string, string | undefined][];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

/** What the request is about, in a few words (the equipment, or the topic of an "other assistance" request). */
export const supportSubject = (d: Partial<SupportInput>) => d.equipment || assistanceTopics.find((t) => t.id === d.topic)?.label || 'Support request';

/** The request as one plain-text message (for the CRM, email or WhatsApp). */
export function supportSummary(d: SupportInput) {
  return [requestTypes.find((t) => t.id === d.type)?.label, `Facility: ${d.facility}`, ...supportDetails(d).map(([k, v]) => `${k}: ${v}`)].join('\n');
}
