import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-mist text-ink-2',
      green: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
      amber: 'bg-mist text-ink-2 ring-1 ring-line',
      red: 'bg-signal/10 text-signal-700 ring-1 ring-signal/20',
      blue: 'bg-paper text-ink-2 ring-1 ring-line',
      dark: 'bg-white/10 text-white ring-1 ring-white/15',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export function Badge({ className, tone, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
