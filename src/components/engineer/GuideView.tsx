'use client';

import { useState } from 'react';
import { Panel } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type Go = 'overview' | 'tickets' | 'website' | 'systems' | 'calibration' | 'docs';
type Step = string | { text: string; tip?: string };
type Section = { id: string; icon: string; title: string; lead: string; steps: Step[]; go?: { label: string; view: Go }; note?: string };

/**
 * The engineers' how-to guide, inside their portal: how the service desk works, task by task, in the order a job
 * happens. Each section has a button that opens the part of the portal it talks about.
 */
const sections: Section[] = [
  {
    id: 'start',
    icon: 'fi-rr-apps',
    title: 'Start your day',
    lead: 'Overview shows what needs you: open requests, jobs nobody has taken, equipment that needs attention and services due soon.',
    steps: [
      'Open Overview. The work queue lists open jobs, the most urgent first.',
      'Red “Unassigned” means no engineer has taken the job yet. Take it if it’s yours.',
      { text: 'The bell (top right) shows alerts: new requests, preventive maintenance due, ratings from hospitals.', tip: 'Allow alerts on your phone (the banner on Overview) so new jobs reach you even when the portal is closed.' },
      '“Live · updated” at the top means the portal is up to date. It checks for news every 15 seconds.',
    ],
    go: { label: 'Open Overview', view: 'overview' },
  },
  {
    id: 'job',
    icon: 'fi-rr-clipboard-list',
    title: 'Work a job, step by step',
    lead: 'Every job moves through the same steps. Each button moves it one step, and the hospital sees every step live.',
    steps: [
      { text: 'Assign to me: the job is yours. The hospital is texted your name and phone number.', tip: 'Take over moves a job from another engineer to you, before they are on site.' },
      'Start travel: choose how long until you arrive. The hospital sees “Engineer on the way”.',
      'Arrived on site: the hospital sees “Engineer on site”.',
      'While you work: add notes (findings, readings) and parts used. Notes reach the hospital.',
      { text: 'Resolve: write the work carried out, enter the km you travelled, and tick “Calibration performed” if you calibrated. The hospital is texted that it’s fixed.', tip: 'Your km count towards your performance report, so enter them every time.' },
      'The hospital then rates the visit (1 to 5 stars). You see the rating on the job.',
    ],
    go: { label: 'Open Service requests', view: 'tickets' },
  },
  {
    id: 'report',
    icon: 'fi-rr-print',
    title: 'Give the hospital its service report',
    lead: 'The one-page report replaces the hand-made hardcopy. The hospital stamps and signs it on the spot.',
    steps: [
      'Open the job and press Service report (top right of the job).',
      'It opens ready to print. Print it, or choose “Save as PDF” in the print window to send it by email or WhatsApp.',
      'It shows the facility, equipment, serial, problem, findings, work done, parts, warranty and next service date.',
      'You sign the Engineer box. The facility signs its box and stamps the Facility stamp box.',
      { text: 'Print it once the work is done and resolved, so the work carried out is on it.', tip: 'Hospitals can also print the same report from their own dashboard, any time after the job is resolved.' },
    ],
    go: { label: 'Open Service requests', view: 'tickets' },
  },
  {
    id: 'pm',
    icon: 'fi-rr-calendar',
    title: 'Preventive maintenance (it schedules itself)',
    lead: 'You don’t book preventive maintenance by hand. The portal follows the department’s schedule and opens the jobs for you.',
    steps: [
      'Under warranty: every machine is serviced twice a year (every 6 months).',
      'After the warranty: IVD equipment (analysers) every quarter (3 months); other equipment on its own interval.',
      'Every morning at 9:00, a Preventive maintenance job opens for each machine due within the next 14 days. You get an alert, and the hospital gets a reminder.',
      'Call the hospital to agree the day, then work it like any other job.',
      { text: 'When you resolve a preventive maintenance job, a service certificate is issued and the next service date is set automatically.', tip: 'The Calibration page lists every machine with its next service date: the red ones are overdue.' },
    ],
    go: { label: 'Open Calibration', view: 'calibration' },
  },
  {
    id: 'equipment',
    icon: 'fi-rr-microscope',
    title: 'Add a hospital’s equipment',
    lead: 'Machines bought through the website appear by themselves. Add machines a hospital already had, so they get a schedule, jobs and certificates.',
    steps: [
      'Equipment → Add existing equipment.',
      'Choose the hospital, then type the equipment: pick it from the list when it’s one of ours (the photo and documents are added).',
      'Enter the serial number (on the rating plate), department, install date, last service and warranty end.',
      { text: 'IVD (an analyser) is ticked for you when the name is an analyser. Check it: analysers are serviced every quarter after the warranty.' },
      { text: 'Tick “Not supplied by Flokefama” for machines we only repair (orphan equipment). They get no warranty or schedule, and their jobs show as repairs.' },
    ],
    go: { label: 'Open Equipment', view: 'systems' },
  },
  {
    id: 'tag',
    icon: 'fi-rr-qrcode',
    title: 'Print and stick the equipment tag',
    lead: 'Every machine gets a tag, as before, now with a QR code. Scanning it opens a fault report for that exact machine.',
    steps: [
      'Open the machine (Equipment, then the machine) and press Print equipment tag.',
      'The tag shows the call centre number, facility, equipment, model, serial number, install date, services, last and next service.',
      'Print it on a label (90 × 60 mm) or on paper, and stick it on the machine where users can see it.',
      { text: 'Print a new tag after each service, so the next service date on it is right.', tip: 'When hospital staff scan the QR code, the Support page opens with the machine, serial and hospital filled in. They only describe the problem.' },
    ],
    go: { label: 'Open Equipment', view: 'systems' },
  },
  {
    id: 'website',
    icon: 'fi-rr-globe',
    title: 'Requests from the website and the call centre',
    lead: 'Anyone can ask for help on the Support page (or by scanning a tag). Those requests come to From the website.',
    steps: [
      'Call the person back first. Then mark it Called back, or press Book a visit.',
      'Book a visit turns it into a job on their machine (the machine is added if it isn’t on record yet).',
      'A machine reported as “not working at all” becomes an urgent job straight away, without waiting for Book a visit.',
      { text: 'A call to the call centre: press Log equipment fault, choose the machine, describe the fault and the priority.', tip: '“Assign to me” is ticked for you, so the job is yours at once.' },
    ],
    go: { label: 'Open From the website', view: 'website' },
  },
  {
    id: 'offline',
    icon: 'fi-rr-wifi',
    title: 'Working without internet',
    lead: 'No signal at the site? Keep working. Nothing is lost.',
    steps: [
      'Every button still works, and what you do shows straight away.',
      'The top of the screen shows “Offline · N changes waiting”: those changes are kept on your phone or laptop.',
      'When the connection is back, they are sent in order by themselves and the label disappears.',
      { text: 'Open the portal before you lose signal (on the way, or at the office). A page opened for the first time offline cannot load.', tip: 'Keep the portal open in your phone’s browser during the visit.' },
    ],
  },
  {
    id: 'performance',
    icon: 'fi-rr-chart-histogram',
    title: 'How your work is counted',
    lead: 'The admin team sees each engineer’s field work for the last 90 days, for appraisals.',
    steps: [
      'Jobs done, by type: preventive maintenance, faults, installations and repairs.',
      'Average response: from the request to you pressing Assign to me. Take jobs quickly.',
      'Average time to fix: from the request to Resolve.',
      'Distance travelled: the km you enter when you resolve. Enter them every time.',
      'Ratings: the stars hospitals give each visit.',
    ],
  },
];

export function GuideView({ onGo }: { onGo: (view: Go) => void }) {
  const [open, setOpen] = useState(sections[0].id);
  const s = sections.find((x) => x.id === open) ?? sections[0];
  const n = sections.indexOf(s);
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Contents */}
      <nav aria-label="Guide contents" className="min-w-0 lg:sticky lg:top-[132px] lg:self-start">
        <Panel className="min-w-0 p-2">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">How-to guide</p>
          <ol className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-0">
            {sections.map((x, i) => (
              <li key={x.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen(x.id)}
                  aria-current={x.id === open ? 'step' : undefined}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition', x.id === open ? 'bg-brand-600 font-semibold text-white' : 'text-ink-2 hover:bg-mist hover:text-ink')}
                >
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold', x.id === open ? 'bg-white/20 text-white' : 'bg-mist text-ink-3')}>{i + 1}</span>
                  <span className="whitespace-nowrap lg:whitespace-normal">{x.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </Panel>
      </nav>

      {/* The section */}
      <Panel className="min-w-0 p-5 md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl text-brand-700"><Icon name={s.icon} /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">Step {n + 1} of {sections.length}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink">{s.title}</h2>
            <p className="mt-2 max-w-2xl text-ink-2">{s.lead}</p>
          </div>
        </div>

        <ol className="mt-7 space-y-3">
          {s.steps.map((step, i) => {
            const st = typeof step === 'string' ? { text: step } : step;
            return (
              <li key={i} className="flex gap-4 rounded-xl border border-line bg-canvas p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <div className="min-w-0 pt-1">
                  <p className="text-[0.9375rem] leading-relaxed text-ink">{st.text}</p>
                  {st.tip && (
                    <p className="mt-2 flex gap-2 text-sm text-ink-3">
                      <Icon name="fi-rr-bulb" className="mt-0.5 shrink-0 text-[#c58a00]" /> {st.tip}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-line pt-5">
          {s.go && (
            <button type="button" onClick={() => onGo(s.go!.view)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-[#006b42]">
              {s.go.label} <Icon name="fi-rr-arrow-small-right" />
            </button>
          )}
          <span className="ml-auto flex flex-wrap justify-end gap-2">
            {n > 0 && (
              <button type="button" onClick={() => setOpen(sections[n - 1].id)} className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink hover:border-ink/30">
                <Icon name="fi-rr-arrow-small-right" className="rotate-180" /> Previous
              </button>
            )}
            {n < sections.length - 1 && (
              <button type="button" onClick={() => setOpen(sections[n + 1].id)} className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink hover:border-ink/30">
                Next: {sections[n + 1].title} <Icon name="fi-rr-arrow-small-right" />
              </button>
            )}
          </span>
        </div>
        {s.note && <p className="mt-4 text-sm text-ink-3">{s.note}</p>}
      </Panel>
    </div>
  );
}
