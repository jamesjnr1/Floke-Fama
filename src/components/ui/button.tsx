import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[transform,background-color,box-shadow,color,border-color] duration-500 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_30px_-10px_rgb(0_112_58/0.7)] hover:bg-brand-700 hover:-translate-y-0.5',
        glow:
          'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_0_1px_rgb(128_196_160/0.25),0_12px_40px_-8px_rgb(63_160_109/0.55)] hover:-translate-y-0.5',
        glass: 'glass text-white hover:bg-white/10 hover:-translate-y-0.5',
        outline: 'border border-line bg-paper text-ink hover:border-ink/30 hover:-translate-y-0.5',
        ghost: 'text-ink hover:bg-mist',
        dark: 'bg-midnight text-white hover:bg-midnight-3 hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-[15px]',
        lg: 'h-14 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
