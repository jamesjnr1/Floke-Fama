'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { DEMO_ENGINEER, DEMO_KEY, restartDemo } from '@/lib/demo';
import { practiceDesk } from '@/lib/service/practice';
import type { ServiceState, Ticket } from '@/lib/service/desk';
import { cn } from '@/lib/utils';

/**
 * The demo's walkthrough: one story told across the three areas, step by step, in a card at the bottom of the screen.
 * A hospital reports a fault → the engineer takes it, travels, arrives and fixes it → the hospital sees it fixed and
 * rates the visit → the office sees everything. Each step ticks itself when it's done (read from the demo's sample
 * desk in this browser, so it works across tabs), and says where to go next.
 */
type Area = 'client' | 'engineer' | 'admin';
const home: Record<Area, { href: string; label: string }> = {
  client: { href: '/portal', label: 'hospital dashboard' },
  engineer: { href: '/engineer', label: 'engineer portal' },
  admin: { href: '/admin', label: 'admin console' },
};
const ADMIN_DONE = 'ff-demo-guide-admin';
const HIDDEN = 'ff-demo-guide-hidden';
const sampleIds = new Set(practiceDesk(DEMO_ENGINEER).tickets.map((t) => t.id));

const read = (): ServiceState | null => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? 'null') as ServiceState | null;
  } catch {
    return null;
  }
};

export function DemoGuide({ area }: { area: Area }) {
  const [desk, setDesk] = useState<ServiceState | null>(null);
  const [adminSeen, setAdminSeen] = useState(false);
  const [open, setOpen] = useState(true);
  // The admin console opens only on a computer (lg and up), so on a phone the last step is told, not visited
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  // The sample desk changes in this tab and in others: look again every second (it's small)
  useEffect(() => {
    const look = () => {
      setDesk(read());
      try {
        setAdminSeen(localStorage.getItem(ADMIN_DONE) === '1');
        setOpen(localStorage.getItem(HIDDEN) !== '1');
      } catch {
        /* ignore */
      }
    };
    look();
    const id = window.setInterval(look, 1000);
    return () => window.clearInterval(id);
  }, []);
  const toggle = useCallback((on: boolean) => {
    setOpen(on);
    try {
      if (on) localStorage.removeItem(HIDDEN);
      else localStorage.setItem(HIDDEN, '1');
    } catch {
      /* ignore */
    }
  }, []);

  // The request the hospital sends in the demo (the newest one that isn't one of the samples)
  const job: Ticket | undefined = useMemo(() => desk?.tickets.filter((t) => !sampleIds.has(t.id)).sort((a, b) => b.openedAt.localeCompare(a.openedAt))[0], [desk]);
  const asset = job && desk?.assets.find((a) => a.id === job.assetId);
  const what = job ? `${job.id}${asset ? ` (${asset.name})` : ''}` : 'the request';

  const steps: { area: Area; title: string; text: string; done: boolean }[] = [
    { area: 'client', title: 'Report a fault, as the hospital', text: 'Press Request service, choose a machine (say the Patient Monitor), describe the problem, choose how urgent it is and send it.', done: Boolean(job) },
    { area: 'engineer', title: 'Take the job, as the engineer', text: `Open Service requests: ${what} is at the top. Open it and press Assign to me. In real life the hospital now gets a text with the engineer's name and number.`, done: Boolean(job?.engineer === DEMO_ENGINEER) },
    { area: 'engineer', title: 'Go to the hospital', text: 'Press Start travel and choose how long you need, then Arrived on site. The hospital sees each step as it happens.', done: job?.status === 'onsite' || job?.status === 'resolved' },
    { area: 'engineer', title: 'Fix it', text: 'Press Resolve, write what you did and the km travelled, and save. The service report is ready to print.', done: job?.status === 'resolved' },
    { area: 'client', title: 'See it fixed, as the hospital', text: `Open Service requests, then the Resolved tab, and open ${what}: it shows what the engineer did. Rate the visit with the stars and press Send rating.`, done: Boolean(job?.rating) },
    small
      ? { area, title: 'See it all from the office', text: 'The office uses the admin console: every hospital, order, engineer and job, with performance and downloads. It opens on a computer: open the demo link there and choose Admin console. Press Done to finish here.', done: adminSeen }
      : { area: 'admin', title: 'See it all from the office', text: 'The admin console shows every hospital, order, engineer and job, with performance and downloads. (It shows its own sample figures.) Look around, then press Done.', done: adminSeen },
  ];
  const n = steps.findIndex((s) => !s.done);
  const finished = n === -1;
  const s = finished ? null : steps[n];
  const here = s?.area === area;

  if (!open)
    return (
      <button type="button" onClick={() => toggle(true)} className="fixed bottom-20 left-3 z-[150] inline-flex h-11 items-center gap-2 rounded-md bg-[#7c4a00] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgb(0_0_0/0.6)] sm:bottom-4 sm:left-4">
        <Icon name="fi-rr-map-marker" /> Demo guide {finished ? '· done' : `· step ${n + 1} of ${steps.length}`}
      </button>
    );

  return (
    <aside aria-label="Demo guide" className="fixed inset-x-3 bottom-20 z-[150] rounded-xl border border-[#e7c98f] bg-[#fffaf0] p-4 text-ink shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[380px]">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-[#7c4a00]">
          Demo guide · {finished ? 'all done' : `step ${n + 1} of ${steps.length}`}
        </p>
        <button type="button" onClick={() => toggle(false)} aria-label="Hide the guide" className="grid size-8 place-items-center rounded-md text-ink-3 hover:bg-black/5 hover:text-ink"><Icon name="fi-rr-cross-small" /></button>
      </div>
      <ol className="mt-2 flex gap-1" aria-hidden>
        {steps.map((x, i) => <li key={i} className={cn('h-1 flex-1 rounded-full', x.done ? 'bg-brand-600' : i === n ? 'bg-[#c98a1b]' : 'bg-[#eadfc8]')} />)}
      </ol>
      {s ? (
        <>
          <h2 className="mt-3 text-[1.0625rem] font-semibold leading-snug">{s.title}</h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{s.text}</p>
          {here ? (
            n === steps.length - 1 ? (
              <button type="button" onClick={() => { try { localStorage.setItem(ADMIN_DONE, '1'); } catch { /* ignore */ } setAdminSeen(true); }} className="mt-3 inline-flex h-10 items-center rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">Done</button>
            ) : (
              <p className="mt-3 text-sm font-medium text-brand-800">You’re in the right place. This step ticks itself when it’s done.</p>
            )
          ) : (
            <a href={home[s.area].href} className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">
              Open the {home[s.area].label} <Icon name="fi-rr-arrow-small-right" />
            </a>
          )}
        </>
      ) : (
        <>
          <h2 className="mt-3 text-[1.0625rem] font-semibold leading-snug">That’s the whole journey</h2>
          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">From a hospital’s fault report to a fixed machine, a rated visit and the office’s overview. Look around freely, or start the story again.</p>
          <button type="button" onClick={() => { try { localStorage.removeItem(ADMIN_DONE); } catch { /* ignore */ } restartDemo(); }} className="mt-3 inline-flex h-10 items-center rounded-md border border-[#7c4a00] px-4 text-sm font-semibold text-[#7c4a00] hover:bg-[#7c4a00]/5">Start again</button>
        </>
      )}
    </aside>
  );
}
