import { addMonths, VERSION, type Asset, type Notification, type ServiceState, type Ticket } from '@/lib/service/desk';

/**
 * Practice mode for the engineer portal: made-up hospitals, machines and jobs to try the portal with. Kept only in
 * this browser: nothing is sent to the server, no hospital is texted, and nothing counts in the performance report.
 */
export const PRACTICE_KEY = 'ff-practice-desk';
export const PRACTICE_FLAG = 'ff-practice';

const DAY = 864e5;
const at = (days: number, hours = 0) => new Date(Date.now() + days * DAY + hours * 36e5).toISOString();
const months = (n: number) => addMonths(new Date(), n).toISOString();

const asset = (a: Partial<Asset> & Pick<Asset, 'id' | 'name' | 'brand' | 'facility' | 'location'>): Asset => ({
  serial: 'Not recorded', readings: [], installed: months(-30), warrantyUntil: months(-18), lastCalibration: months(-3), nextCalibration: at(10),
  intervalMonths: 12, certificates: [], ...a,
});

export function practiceDesk(me: string): ServiceState {
  const assets: Asset[] = [
    asset({ id: 'AS-PR01', name: 'BC-5150 Haematology Analyzer', brand: 'Mindray', productSlug: 'auto-heamatology-analyzer-bc5150', serial: 'BC51-20931', facility: 'Ridge Practice Hospital', location: 'Main laboratory', ivd: true, lastCalibration: months(-3), nextCalibration: at(6) }),
    asset({ id: 'AS-PR02', name: 'Patient Monitor', brand: 'Comen', productSlug: 'patient-monitor-comen', serial: 'CM-77412', facility: 'Ridge Practice Hospital', location: 'ICU, bed 4', installed: months(-4), warrantyUntil: months(8), lastCalibration: months(-4), nextCalibration: months(2) }),
    asset({ id: 'AS-PR03', name: 'Benchtop Centrifuge', brand: 'Generic', serial: 'CF-0098', facility: 'Ridge Practice Hospital', location: 'Blood bank', suppliedByUs: false, nextCalibration: months(12) }),
    asset({ id: 'AS-PR04', name: 'BS-240 Chemistry Analyzer', brand: 'Mindray', serial: 'BS24-11873', facility: 'Kasoa Practice Clinic', location: 'Laboratory', ivd: true, installed: months(-14), warrantyUntil: months(-2), lastCalibration: months(-2), nextCalibration: months(1) }),
    asset({ id: 'AS-PR05', name: 'Autoclave Machine 35L', brand: 'Flokefama', productSlug: 'autoclave-machine-35l', serial: 'Recorded at installation', facility: 'Kasoa Practice Clinic', location: 'Set at installation', installed: at(0), warrantyUntil: months(12), lastCalibration: at(0), nextCalibration: months(6), intervalMonths: 6, installation: { order: 'FF-PRACTICE-01' } }),
    asset({ id: 'AS-PR06', name: 'CPAP Machine', brand: 'Flokefama', productSlug: 'cpap-machine', serial: 'CP-55120', facility: 'Kasoa Practice Clinic', location: 'Children’s ward', installed: months(-8), warrantyUntil: months(4), lastCalibration: months(-2), nextCalibration: months(4) }),
  ];
  const t = (x: Partial<Ticket> & Pick<Ticket, 'id' | 'assetId' | 'title' | 'description' | 'priority' | 'status' | 'openedAt'>): Ticket => ({ log: [], parts: [], ...x });
  const tickets: Ticket[] = [
    t({
      id: 'TK-9006', assetId: 'AS-PR02', title: 'Patient Monitor: Screen goes blank, alarms not sounding', priority: 'critical', status: 'new', openedAt: at(0, -0.3),
      description: 'Screen goes blank every few minutes and the alarms are not sounding. A patient is on it in the ICU.', requestedBy: 'Nurse Efua (ICU)', contactPhone: '024 000 1234',
      log: [{ at: at(0, -0.3), by: 'Nurse Efua (ICU)', text: 'Request submitted by Nurse Efua (ICU)', kind: 'system' }],
    }),
    t({
      id: 'TK-9005', assetId: 'AS-PR01', kind: 'pm', title: 'BC-5150 Haematology Analyzer: preventive maintenance', priority: 'routine', status: 'new', openedAt: at(0, -8),
      description: `Scheduled preventive maintenance, due ${new Date(at(6)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. After warranty (IVD): serviced every quarter.`, requestedBy: 'Service schedule',
      log: [{ at: at(0, -8), by: 'System', text: 'Preventive maintenance due in 6 days', kind: 'system' }],
    }),
    t({
      id: 'TK-9004', assetId: 'AS-PR03', kind: 'repair', title: 'Benchtop Centrifuge: Does not reach speed, loud noise', priority: 'high', status: 'new', openedAt: at(-1),
      description: 'It does not reach speed and makes a loud grinding noise. It was not bought from Flokefama.', requestedBy: 'Lab manager', contactPhone: '055 000 4321',
      log: [{ at: at(-1), by: 'Lab manager', text: 'Request submitted by Lab manager', kind: 'system' }],
    }),
    t({
      id: 'TK-9003', assetId: 'AS-PR05', kind: 'installation', title: 'Autoclave Machine 35L: delivery, installation and commissioning', priority: 'routine', status: 'new', openedAt: at(-1, -3),
      description: 'Deliver, install and commission the Autoclave Machine 35L bought on order FF-PRACTICE-01, then train the users.', requestedBy: 'Flokefama sales',
      log: [{ at: at(-1, -3), by: 'System', text: 'Installation booked from order FF-PRACTICE-01', kind: 'system' }],
    }),
    t({
      id: 'TK-9002', assetId: 'AS-PR04', title: 'BS-240 Chemistry Analyzer: Error E-21 at start-up', priority: 'high', status: 'travelling', openedAt: at(0, -3), engineer: me, eta: '30 mins',
      description: 'Error E-21 at start-up, the analyser will not run samples.', requestedBy: 'Lab scientist Kofi', contactPhone: '020 000 5678',
      log: [
        { at: at(0, -3), by: 'Lab scientist Kofi', text: 'Request submitted by Lab scientist Kofi', kind: 'system' },
        { at: at(0, -2.5), by: me, text: `Assigned to ${me}`, kind: 'status' },
        { at: at(0, -0.5), by: me, text: 'En route · ETA 30 mins', kind: 'status' },
      ],
    }),
    t({
      id: 'TK-9001', assetId: 'AS-PR06', title: 'CPAP Machine: Pressure alarm keeps going off', priority: 'high', status: 'resolved', openedAt: at(-6), engineer: me, resolvedAt: at(-5), km: 22,
      description: 'The pressure alarm keeps going off on low settings.', requestedBy: 'Ward nurse', resolution: 'Replaced the cracked pressure tube and the inlet filter. Tested at all pressure settings: no alarms.', rating: 5, feedback: 'Fast and very professional',
      parts: [{ name: 'Pressure tube', qty: 1 }, { name: 'Inlet filter', qty: 1 }],
      log: [
        { at: at(-6), by: 'Ward nurse', text: 'Request submitted by Ward nurse', kind: 'system' },
        { at: at(-6, 1), by: me, text: `Assigned to ${me}`, kind: 'status' },
        { at: at(-5), by: me, text: 'Resolved · 22 km travelled', kind: 'status' },
        { at: at(-4), by: 'Ward nurse', text: 'Rated the service 5/5: “Fast and very professional”', kind: 'note' },
      ],
    }),
  ];
  const n = (id: string, text: string, ticketId: string, hours: number): Notification => ({ id, at: at(0, hours), text, audience: 'engineer', ticketId, read: false });
  const notifications: Notification[] = [
    n('N-PR1', 'New critical request TK-9006 from Ridge Practice Hospital: Patient Monitor.', 'TK-9006', -0.3),
    n('N-PR2', 'Preventive maintenance due for BC-5150 Haematology Analyzer at Ridge Practice Hospital (TK-9005).', 'TK-9005', -8),
    n('N-PR3', 'New high request TK-9004 from Ridge Practice Hospital: Benchtop Centrifuge.', 'TK-9004', -24),
  ];
  return { version: VERSION, assets, tickets, notifications };
}

/**
 * The practice hospital answers like a real one: shortly after a job is resolved, it rates the visit.
 * Returns the ratings to apply (job id and rating) for jobs resolved but not yet rated.
 */
export const practiceComments = ['Thank you, it is working well now.', 'Very quick response, thank you.', 'Good work, and the report was clear.'];
