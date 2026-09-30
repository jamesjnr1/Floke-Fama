'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { tickets as seedTickets, type Ticket, type TicketStatus } from '@/data/client-portal-demo';
import { cn } from '@/lib/utils';

export const statusMeta: Record<TicketStatus, { label: string; tone: 'green' | 'blue' | 'amber' | 'neutral' }> = {
  'en-route': { label: 'Engineer en route', tone: 'green' },
  scheduled: { label: 'Scheduled', tone: 'blue' },
  open: { label: 'Awaiting engineer', tone: 'amber' },
  resolved: { label: 'Resolved', tone: 'neutral' },
};
const priorityDot = { critical: 'bg-signal', high: 'bg-brand-500', routine: 'bg-ink-3/40' };

function dispatchToast(t: Ticket) {
  if (!t.engineer) return;
  toast(`Biomedical Engineer ${t.engineer.name} has departed ${t.engineer.hub} for your facility.`, {
    description: `${t.id} · ${t.asset}${t.engineer.eta ? ` · ETA ${t.engineer.eta}` : ''}`,
    icon: <Icon name="fi-rr-truck-side" className="text-brand-600" />,
    duration: 7000,
  });
}

export function Tickets() {
  const [tickets, setTickets] = useState(seedTickets);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = tickets.find((t) => t.id === openId) ?? null;

  // Demo: simulate the coordinator dispatching an engineer shortly after arrival.
  useEffect(() => {
    const id = setTimeout(() => dispatchToast(seedTickets[0]), 2200);
    return () => clearTimeout(id);
  }, []);

  const assignEngineer = (t: Ticket) => {
    const engineer = { name: 'Ama K.', hub: 'Korle-Bu branch', eta: '30 mins' };
    const updated: Ticket = { ...t, status: 'en-route', engineer, timeline: [...t.timeline, { time: 'Now', text: `Engineer ${engineer.name} departed ${engineer.hub}` }] };
    setTickets((all) => all.map((x) => (x.id === t.id ? updated : x)));
    dispatchToast(updated);
  };

  return (
    <>
      <ul className="grid gap-3 md:grid-cols-2">
        {tickets.map((t) => (
          <li key={t.id}>
            <motion.button
              layoutId={`ticket-${t.id}`}
              onClick={() => setOpenId(t.id)}
              className="group flex w-full flex-col gap-6 rounded-4xl border border-line bg-paper p-6 text-left transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(11_21_16/0.35)]"
              style={{ borderRadius: 32 }}
            >
              <motion.div layout="position" className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium tracking-wider text-ink-3">
                  <span className={cn('size-2 rounded-full', priorityDot[t.priority])} aria-label={`${t.priority} priority`} />
                  {t.id} · {t.opened}
                </span>
                <Badge tone={statusMeta[t.status].tone}>{statusMeta[t.status].label}</Badge>
              </motion.div>
              <motion.div layout="position">
                <p className="text-sm text-ink-3">{t.asset}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{t.title}</p>
              </motion.div>
              <motion.div layout="position" className="flex w-full items-center justify-between text-sm">
                <span className="text-ink-3">{t.engineer ? `Engineer: ${t.engineer.name}` : 'Unassigned'}</span>
                <span className="inline-flex items-center gap-1 font-medium text-brand-600">Inspect <Icon name="fi-rr-arrow-small-right" className="transition-transform group-hover:translate-x-1" /></span>
              </motion.div>
            </motion.button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={Boolean(open)} onOpenChange={(v) => !v && setOpenId(null)}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-midnight/50 backdrop-blur-sm" />
              </Dialog.Overlay>
              <div className="pointer-events-none fixed inset-0 z-[70] grid place-items-center p-3 md:p-8">
                <Dialog.Content asChild forceMount aria-describedby={undefined}>
                  <motion.div layoutId={`ticket-${open.id}`} style={{ borderRadius: 40 }} className="pointer-events-auto relative max-h-full w-full max-w-3xl overflow-y-auto bg-paper p-6 shadow-2xl outline-none md:p-10">
                    <InspectionPanel ticket={open} onAssign={() => assignEngineer(open)} />
                    <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-mist text-ink hover:bg-line" aria-label="Close">
                      <Icon name="fi-rr-cross-small" />
                    </Dialog.Close>
                  </motion.div>
                </Dialog.Content>
              </div>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}

function InspectionPanel({ ticket, onAssign }: { ticket: Ticket; onAssign: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap items-center gap-3 pr-12">
        <Badge tone={statusMeta[ticket.status].tone}>{statusMeta[ticket.status].label}</Badge>
        <span className="label">{ticket.id} · {ticket.priority} priority</span>
      </div>
      <Dialog.Title className="display mt-5 text-3xl md:text-4xl">{ticket.title}</Dialog.Title>
      <p className="mt-2 text-ink-3">{ticket.asset}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Opened" value={ticket.opened} icon="fi-rr-clock-three" />
        <Stat label="Engineer" value={ticket.engineer?.name ?? 'Unassigned'} icon="fi-rr-user" />
        <Stat label="ETA" value={ticket.engineer?.eta ?? (ticket.status === 'resolved' ? 'Completed' : 'Pending')} icon="fi-rr-truck-side" />
      </div>

      <h3 className="label mt-10">Activity</h3>
      <ol className="relative mt-4 space-y-5 border-l border-line pl-6">
        {ticket.timeline.map((e, i) => (
          <motion.li key={`${e.time}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }} className="relative">
            <span className={cn('absolute -left-[29px] top-1 size-2.5 rounded-full ring-4 ring-paper', i === ticket.timeline.length - 1 ? 'bg-brand-500' : 'bg-line')} />
            <p className="text-xs text-ink-3">{e.time}</p>
            <p className="text-sm text-ink">{e.text}</p>
          </motion.li>
        ))}
      </ol>

      {ticket.status === 'open' && (
        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-3xl bg-brand-50 p-5">
          <p className="flex-1 text-sm text-brand-700">Coordinator view (demo): dispatch the nearest available engineer.</p>
          <Button size="sm" onClick={onAssign}><Icon name="fi-rr-truck-side" /> Assign &amp; dispatch</Button>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-canvas p-5">
      <Icon name={icon} className="text-brand-600" />
      <p className="mt-4 text-xs text-ink-3">{label}</p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  );
}
