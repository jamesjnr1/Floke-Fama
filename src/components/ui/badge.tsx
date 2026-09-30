import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-mist text-ink-2',
      green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
      red: 'bg-red-50 text-red-700 ring-1 ring-red-100',
      blue: 'bg-sky-50 text-sky-800 ring-1 ring-sky-100',
      dark: 'bg-white/10 text-white ring-1 ring-white/15',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export function Badge({ className, tone, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
