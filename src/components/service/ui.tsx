'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { priorityStyle } from '@/components/service/status';
import { Icon } from '@/components/ui/icon';
import type { Priority } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/**
 * Engineer portal primitives, in the same plain style as the hospital dashboard. They use the theme colours
 * (paper, line, ink…), which the portal's dark mode redefines, so every screen works in light and dark.
 */
export const fieldClass =
  'w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink outline-none transition placeholder:text-ink-3/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

/** Small square status tag (no pills). Pair with a colour from status.ts. */
export const tag = 'inline-flex shrink-0 items-center gap-1.5 rounded-[4px] px-2 py-1 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.07em]';

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-3', className)}>{children}</h2>;
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-xl border border-line bg-paper', className)}>{children}</div>;
}

/** A card's title row: label on the left, an optional link or button on the right. */
export function PanelHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
      <SectionLabel>{title}</SectionLabel>
      {action}
    </div>
  );
}

export const linkButton = 'text-sm font-medium text-ink-2 hover:text-ink';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(tag, priorityStyle[priority])}>{priority}</span>;
}

export function PrimaryButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006b42] disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  );
}

export function GhostButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition hover:border-ink/30 disabled:opacity-40', className)}
      {...props}
    />
  );
}

/** Dialog shell shared by the portal's forms. */
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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[70] max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-paper p-6 text-ink shadow-2xl outline-none md:p-8"
        >
          <Dialog.Title className="text-xl font-semibold tracking-[-0.01em] text-ink">{title}</Dialog.Title>
          {description ? <p className="mt-1 text-sm text-ink-3">{description}</p> : null}
          <Dialog.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-md text-ink-3 hover:bg-canvas hover:text-ink" aria-label="Close">
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
      <span className="font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}

/** A choice button inside a form (priority, result): square, outlined, green when chosen. */
export const choiceClass = (on: boolean) =>
  cn('rounded-lg border px-3 py-2.5 text-sm transition', on ? 'border-brand-500 bg-brand-50 font-medium text-ink' : 'border-line text-ink-2 hover:border-ink/30');
