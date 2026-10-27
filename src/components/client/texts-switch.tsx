'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Client portal: whether Flokefama texts this hospital (check-ins after visits, calibration reminders, greetings and
 * news). Shown only when texts are switched on for the site.
 */
export function TextsSwitch({ className }: { className?: string }) {
  const [state, setState] = useState<{ on: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/texts', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { enabled?: boolean; on?: boolean } | null) => j?.enabled && setState({ on: j.on !== false }))
      .catch(() => {});
  }, []);
  if (!state) return null;
  const change = async () => {
    setBusy(true);
    const on = !state.on;
    const r = await fetch('/api/texts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ on }) }).catch(() => null);
    setBusy(false);
    if (!r?.ok) return toast.error('Not saved', { description: 'Please try again.' });
    setState({ on });
    toast.success(on ? 'Texts from Flokefama are on' : 'Texts from Flokefama are off', { description: on ? 'Reminders, check-ins and news come to your phone.' : 'You still see everything here in your portal.' });
  };
  return (
    <button type="button" onClick={change} disabled={busy} aria-pressed={state.on} className={cn('flex items-center gap-2.5 disabled:opacity-60', className)}>
      <Icon name="fi-rr-comment" /> Texts from us: {state.on ? 'On' : 'Off'}
    </button>
  );
}
