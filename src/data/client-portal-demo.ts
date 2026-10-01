/**
 * DEMO DATA for the Flokefama Care client portal. The facility, people, serials and dates
 * are fictional and exist only to demonstrate the experience. In production this comes from
 * the service-management backend behind authenticated sessions.
 */
export type TicketStatus = 'en-route' | 'scheduled' | 'open' | 'resolved';

export interface Ticket {
  id: string;
  asset: string;
  title: string;
  status: TicketStatus;
  priority: 'critical' | 'high' | 'routine';
  opened: string;
  engineer?: { name: string; hub: string; eta?: string };
  timeline: { time: string; text: string }[];
}

export interface Asset {
  id: string;
  name: string;
  brand: string;
  productSlug?: string;
  image?: string;
  serial: string;
  location: string;
  installed: string;
  warrantyUntil: string;
  lastCalibration: string;
  nextCalibration: string;
  health: 'good' | 'due' | 'attention';
  certificates: { id: string; date: string; result: 'Pass' | 'Adjusted'; engineer: string }[];
}

export const demoFacility = { name: 'Demo Regional Hospital', site: 'Main laboratory & wards' };

export const tickets: Ticket[] = [
  {
    id: 'TK-1042',
    asset: 'Mindray BC-5150',
    title: 'Background count high on start-up',
    status: 'en-route',
    priority: 'high',
    opened: 'Today, 08:12',
    engineer: { name: 'Kwame A.', hub: 'Accra hub', eta: '45 mins' },
    timeline: [
      { time: '08:12', text: 'Fault logged by lab manager' },
      { time: '08:20', text: 'Remote diagnostics: probe cleaning cycle advised' },
      { time: '08:41', text: 'Engineer assigned: Kwame A.' },
      { time: '08:55', text: 'Engineer departed Accra hub' },
    ],
  },
  {
    id: 'TK-1039',
    asset: 'Mindray chemistry analyser',
    title: 'Quarterly preventive maintenance',
    status: 'scheduled',
    priority: 'routine',
    opened: 'Mon, 09:00',
    engineer: { name: 'Esi M.', hub: 'Accra hub' },
    timeline: [
      { time: 'Mon', text: 'PM visit booked for Thursday, 10:00' },
      { time: 'Mon', text: 'Reagent inventory check added to visit' },
    ],
  },
  {
    id: 'TK-1036',
    asset: 'Patient monitor · Ward B',
    title: 'SpO₂ probe intermittent reading',
    status: 'open',
    priority: 'critical',
    opened: 'Yesterday, 17:40',
    timeline: [
      { time: '17:40', text: 'Fault logged by ward nurse' },
      { time: '17:52', text: 'Replacement probe dispatched from stock' },
    ],
  },
  {
    id: 'TK-1031',
    asset: 'Autoclave 50 L',
    title: 'Door seal replaced',
    status: 'resolved',
    priority: 'routine',
    opened: '12 Sep',
    engineer: { name: 'Yaw O.', hub: 'Accra hub' },
    timeline: [
      { time: '12 Sep', text: 'Leak reported during cycle' },
      { time: '13 Sep', text: 'Seal replaced, validation cycle passed' },
    ],
  },
];

export const assets: Asset[] = [
  {
    id: 'AS-01',
    name: 'Semi-Auto Chemistry Analyser',
    brand: 'Mindray',
    productSlug: 'mindray-semi-auto-chemistry',
    serial: 'DEMO-BS240-0917',
    location: 'Main laboratory',
    installed: '14 Feb 2025',
    warrantyUntil: '14 Feb 2027',
    lastCalibration: '02 Jul 2026',
    nextCalibration: '02 Oct 2026',
    health: 'due',
    certificates: [
      { id: 'CAL-2026-07', date: '02 Jul 2026', result: 'Pass', engineer: 'Esi M.' },
      { id: 'CAL-2026-04', date: '03 Apr 2026', result: 'Adjusted', engineer: 'Esi M.' },
      { id: 'CAL-2026-01', date: '06 Jan 2026', result: 'Pass', engineer: 'Kwame A.' },
    ],
  },
  {
    id: 'AS-02',
    name: 'BC-5150 Haematology Analyser',
    brand: 'Mindray',
    productSlug: 'mindray-bc-5150',
    serial: 'DEMO-BC5150-0442',
    location: 'Main laboratory',
    installed: '20 Jun 2024',
    warrantyUntil: '20 Jun 2026',
    lastCalibration: '11 Aug 2026',
    nextCalibration: '11 Nov 2026',
    health: 'attention',
    certificates: [
      { id: 'CAL-2026-08', date: '11 Aug 2026', result: 'Pass', engineer: 'Kwame A.' },
      { id: 'CAL-2026-05', date: '09 May 2026', result: 'Pass', engineer: 'Kwame A.' },
    ],
  },
  {
    id: 'AS-03',
    name: 'CX23 Clinical Microscope',
    brand: 'Olympus',
    productSlug: 'olympus-cx23',
    image: '/images/products/olympus-cx23.webp',
    serial: 'DEMO-CX23-1180',
    location: 'Microbiology',
    installed: '03 Mar 2025',
    warrantyUntil: '03 Mar 2027',
    lastCalibration: '15 Jul 2026',
    nextCalibration: '15 Jan 2027',
    health: 'good',
    certificates: [{ id: 'SRV-2026-07', date: '15 Jul 2026', result: 'Pass', engineer: 'Yaw O.' }],
  },
];
