/**
 * DEMO DATA for the Biomedical Engineer Service Portal. The facility, people, serials, readings
 * and uptime figures are fictional and exist only to demonstrate the experience. In production
 * this comes from the service-management backend behind authenticated sessions.
 */
export type AssetStatus = 'online' | 'maintenance' | 'attention';

export interface Asset {
  id: string;
  name: string;
  brand: string;
  productSlug?: string;
  image?: string;
  serial: string;
  location: string;
  status: AssetStatus;
  /** Recent utilisation / signal readings for the sparkline (demo). */
  readings: number[];
  installed: string;
  warrantyUntil: string;
  lastCalibration: string;
  nextCalibration: string;
  certificates: { id: string; date: string; result: 'Pass' | 'Adjusted'; engineer: string }[];
}

export interface TicketStep {
  label: string;
  detail?: string;
}

export interface Ticket {
  id: string;
  assetId: string;
  title: string;
  priority: 'critical' | 'high' | 'routine';
  opened: string;
  engineer?: { name: string; hub: string; eta?: string };
  steps: TicketStep[];
  /** Index of the step currently in progress (steps before it are complete). */
  current: number;
}


export const assets: Asset[] = [
  {
    id: 'AS-01', name: 'BS-240 Chemistry Analyser', brand: 'Mindray', productSlug: 'mindray-bs-240', image: '/images/bs-240-stage.webp',
    serial: 'DEMO-BS240-0917', location: 'Main laboratory', status: 'online', readings: [42, 48, 45, 60, 58, 66, 71, 64, 72, 78],
    installed: '14 Feb 2025', warrantyUntil: '14 Feb 2027', lastCalibration: '02 Jul 2026', nextCalibration: '02 Oct 2026',
    certificates: [
      { id: 'CAL-2026-07', date: '02 Jul 2026', result: 'Pass', engineer: 'Esi M.' },
      { id: 'CAL-2026-04', date: '03 Apr 2026', result: 'Adjusted', engineer: 'Esi M.' },
      { id: 'CAL-2026-01', date: '06 Jan 2026', result: 'Pass', engineer: 'Kwame B.' },
    ],
  },
  {
    id: 'AS-02', name: 'BC-5150 Haematology Analyser', brand: 'Mindray', productSlug: 'mindray-bc-5150',
    serial: 'DEMO-BC5150-0442', location: 'Main laboratory', status: 'attention', readings: [70, 66, 72, 61, 40, 38, 52, 35, 30, 33],
    installed: '20 Jun 2024', warrantyUntil: '20 Jun 2026', lastCalibration: '11 Aug 2026', nextCalibration: '11 Nov 2026',
    certificates: [
      { id: 'CAL-2026-08', date: '11 Aug 2026', result: 'Pass', engineer: 'Kwame B.' },
      { id: 'CAL-2026-05', date: '09 May 2026', result: 'Pass', engineer: 'Kwame B.' },
    ],
  },
  {
    id: 'AS-03', name: 'Mobile Digital X-Ray System', brand: 'Radiology',
    serial: 'DEMO-DR-2210', location: 'Emergency unit', status: 'maintenance', readings: [55, 58, 52, 50, 49, 20, 18, 22, 25, 24],
    installed: '08 Nov 2024', warrantyUntil: '08 Nov 2027', lastCalibration: '19 Jun 2026', nextCalibration: '19 Dec 2026',
    certificates: [{ id: 'QA-2026-06', date: '19 Jun 2026', result: 'Pass', engineer: 'Yaw O.' }],
  },
  {
    id: 'AS-04', name: 'CX23 Clinical Microscope', brand: 'Olympus', productSlug: 'olympus-cx23', image: '/images/products/olympus-cx23.webp',
    serial: 'DEMO-CX23-1180', location: 'Microbiology', status: 'online', readings: [30, 34, 33, 38, 36, 40, 39, 42, 41, 44],
    installed: '03 Mar 2025', warrantyUntil: '03 Mar 2027', lastCalibration: '15 Jul 2026', nextCalibration: '15 Jan 2027',
    certificates: [{ id: 'SRV-2026-07', date: '15 Jul 2026', result: 'Pass', engineer: 'Yaw O.' }],
  },
  {
    id: 'AS-05', name: 'Autoclave Steriliser 50 L', brand: 'Sterile services',
    serial: 'DEMO-AC50-0078', location: 'CSSD', status: 'online', readings: [60, 62, 61, 63, 60, 64, 65, 63, 66, 67],
    installed: '12 Jan 2024', warrantyUntil: '12 Jan 2026', lastCalibration: '13 Sep 2026', nextCalibration: '13 Mar 2027',
    certificates: [{ id: 'VAL-2026-09', date: '13 Sep 2026', result: 'Pass', engineer: 'Yaw O.' }],
  },
];

export const tickets: Ticket[] = [
  {
    id: 'TK-1044', assetId: 'AS-03', title: 'Mobile Digital X-Ray System', priority: 'critical', opened: 'Today, 07:48',
    engineer: { name: 'Kwame Boateng', hub: 'Accra hub', eta: 'On site' },
    steps: [
      { label: 'Log ticket', detail: 'Detector not initialising after power cycle' },
      { label: 'Engineer assigned', detail: 'Kwame Boateng · Accra hub' },
      { label: 'On-site diagnostics', detail: 'Detector firmware and tether cable under test' },
      { label: 'Resolution' },
    ],
    current: 2,
  },
  {
    id: 'TK-1042', assetId: 'AS-02', title: 'BC-5150: background count high', priority: 'high', opened: 'Today, 08:12',
    engineer: { name: 'Ama K.', hub: 'Korle-Bu branch', eta: '45 mins' },
    steps: [
      { label: 'Log ticket', detail: 'High background on start-up' },
      { label: 'Engineer assigned', detail: 'Ama K. · Korle-Bu branch' },
      { label: 'On-site diagnostics' },
      { label: 'Resolution' },
    ],
    current: 1,
  },
  {
    id: 'TK-1039', assetId: 'AS-01', title: 'BS-240: quarterly preventive maintenance', priority: 'routine', opened: 'Mon, 09:00',
    steps: [{ label: 'Log ticket', detail: 'Scheduled PM visit' }, { label: 'Engineer assigned' }, { label: 'On-site diagnostics' }, { label: 'Resolution' }],
    current: 1,
  },
];

/** Demo fleet uptime shown in the radial chart. */
export const demoUptime = 99.4;
