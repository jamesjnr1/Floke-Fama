'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { priorityStyle } from '@/components/service/status';
import { Icon } from '@/components/ui/icon';
import type { Priority } from '@/lib/service/store';
import { cn } from '@/lib/utils';

export const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20';

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('font-mono text-[11px] uppercase tracking-widest text-white/60', className)}>{children}</h2>;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-[20px] border border-white/[0.06] bg-white/[0.03]', className)}>{children}</div>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn('rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1', priorityStyle[priority])}>{priority}</span>;
}

export function PrimaryButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl bg-yellow px-4 py-2.5 text-sm font-semibold text-midnight transition hover:bg-[#a3d470] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/60', className)}
      {...props}
    />
  );
}

export function GhostButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40', className)}
      {...props}
    />
  );
}

/** Dark dialog shell shared by the portal's forms. */
export function PortalDialog({ open, onOpenChange, title, description, children }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={description ? undefined : undefined}
          className="fixed left-1/2 top-1/2 z-[70] max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/10 bg-[#111d17] p-6 text-white shadow-2xl outline-none md:p-8"
        >
          <Dialog.Title className="text-2xl font-bold tracking-[-0.02em] text-white">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-1 text-sm text-white/75">{description}</Dialog.Description> : null}
          <Dialog.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-white/75 hover:bg-white/10 hover:text-white" aria-label="Close">
            <Icon name="fi-rr-cross-small" />
          </Dialog.Close>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[11px] uppercase tracking-widest text-white/75">{label}</span>
      {children}
    </label>
  );
}
